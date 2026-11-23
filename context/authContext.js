import { createContext, useContext, useEffect, useState } from "react";
import {
  acceptInvite as identityAcceptInvite,
  getUser,
  handleAuthCallback,
  login as identityLogin,
  logout as identityLogout,
  onAuthChange,
  requestPasswordRecovery,
  signup as identitySignup,
  updateUser,
} from "@netlify/identity";

const AuthContext = createContext();
const AUTH_HASH_PATTERN =
  /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;
const DEV_AUTH_BYPASS_ENABLED =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
const DEV_USER = {
  id: "local-preview-user",
  email: "local-preview@photopresets.test",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (DEV_AUTH_BYPASS_ENABLED) {
      setUser(DEV_USER);
      setAuthReady(true);
      return undefined;
    }

    let active = true;
    const unsubscribe = onAuthChange((_event, nextUser) => {
      if (active) setUser(nextUser);
    });

    async function initializeAuth() {
      try {
        if (AUTH_HASH_PATTERN.test(window.location.hash)) {
          const result = await handleAuthCallback();
          if (!active || !result) return;

          if (result.type === "recovery") {
            window.location.replace("/account?mode=recovery");
            return;
          }
          if (result.type === "invite" && result.token) {
            window.location.replace(
              `/account?mode=invite&token=${encodeURIComponent(result.token)}`,
            );
            return;
          }
          const storedReturnTo = window.localStorage.getItem(
            "photo-presets-auth-return-to",
          );
          window.localStorage.removeItem("photo-presets-auth-return-to");
          const returnTo =
            storedReturnTo?.startsWith("/") &&
            !storedReturnTo.startsWith("//")
              ? storedReturnTo
              : "/account?confirmed=1";
          window.location.replace(returnTo);
          return;
        }

        const currentUser = await getUser();
        if (active) setUser(currentUser);
      } catch (error) {
        console.error("Identity initialization failed:", error);
      } finally {
        if (active) setAuthReady(true);
      }
    }

    initializeAuth();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => identityLogin(email, password);
  const signup = async (email, password) => identitySignup(email, password);
  const logout = async () => identityLogout();
  const sendPasswordRecovery = async (email) => requestPasswordRecovery(email);
  const resetPassword = async (password) => updateUser({ password });
  const acceptInvite = async (token, password) =>
    identityAcceptInvite(token, password);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isLoggedIn: Boolean(user),
        login,
        signup,
        logout,
        sendPasswordRecovery,
        resetPassword,
        acceptInvite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
