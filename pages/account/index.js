import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import { useAuth } from "../../context/authContext";
import Hat from "../../public/images/assets/hat.png";
import Star from "../../public/images/assets/starette.webp";

const inputClass =
  "french-news w-full border-2 border-transparent bg-white px-4 py-3 text-xl text-black outline-none placeholder:text-gray-500 focus:border-accent sm:text-2xl";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    authReady,
    login,
    signup,
    logout,
    sendPasswordRecovery,
    resetPassword,
    acceptInvite,
  } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const requestedMode = router.query.mode;
    if (["register", "forgot", "recovery", "invite"].includes(requestedMode)) {
      setMode(requestedMode);
    }
    if (router.query.confirmed) {
      setMessage("Your email is confirmed and your account is ready.");
    }
  }, [router.isReady, router.query.mode, router.query.confirmed]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const finishLogin = async () => {
    const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : "/account";
    await router.push(returnTo);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (["register", "recovery", "invite"].includes(mode) && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        await finishLogin();
      } else if (mode === "register") {
        const newUser = await signup(email, password);
        if (newUser?.confirmedAt) {
          await finishLogin();
        } else {
          setMessage("Check your email for a confirmation link, then return here to log in.");
        }
      } else if (mode === "forgot") {
        await sendPasswordRecovery(email);
        setMessage("Check your email for a password-reset link.");
      } else if (mode === "recovery") {
        await resetPassword(password);
        setMessage("Your password has been updated.");
        setMode("login");
      } else if (mode === "invite") {
        const token = typeof router.query.token === "string" ? router.query.token : "";
        if (!token) throw new Error("This invitation link is incomplete.");
        await acceptInvite(token, password);
        await finishLogin();
      }
    } catch (authError) {
      setError(authError?.message || "We couldn't complete that request.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = {
    login: "Log In",
    register: "Register",
    forgot: "Reset Password",
    recovery: "Choose New Password",
    invite: "Create Your Password",
  }[mode];

  return (
    <>
      <Head>
        <title>Account | Photo Presets</title>
      </Head>
      <Layout backgroundColor="bg-backgroundBlueFaded" backgroundImage="bg-victorianPattern">
        <main className="mx-auto mt-24 w-full max-w-3xl pb-16 sm:mt-28">
          <h1 className="french-news mb-5 text-center text-5xl text-black sm:text-7xl">
            Account
          </h1>
          <section className="rounded-[2.5rem] border-2 border-accent bg-darkCard px-6 py-10 text-white shadow-cool-shadow sm:px-16 sm:py-12">
            <div className="mb-8 flex items-center justify-center gap-5 sm:gap-10">
              <Image src={Star} alt="" className="h-auto w-9 sm:w-12" />
              <Image src={Hat} alt="" className="h-auto w-32 sm:w-48" priority />
              <Image src={Star} alt="" className="h-auto w-9 sm:w-12" />
            </div>

            {!authReady ? (
              <p className="french-news py-10 text-center text-2xl text-accent">
                Opening your account…
              </p>
            ) : user && !["recovery", "invite"].includes(mode) ? (
              <div className="text-center">
                <h2 className="french-news text-3xl text-accent">Welcome Back</h2>
                <p className="mt-3 text-lg">{user.email}</p>
                {message && <p className="mt-4 text-green-300">{message}</p>}
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/downloads" className="menu-btn-lg bourbonbase letterpress-button px-6 py-3 text-xl text-accent">
                    Your Library
                  </Link>
                  <button type="button" onClick={logout} className="menu-btn-lg bourbonbase letterpress-button px-6 py-3 text-xl text-accent">
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto max-w-md">
                <h2 className="sr-only">{title}</h2>
                {["login", "register", "forgot"].includes(mode) && (
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email Address" className={inputClass} />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label className="mt-5 block">
                    <span className="sr-only">Password</span>
                    <input type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "login" ? "Pass-Word" : "Choose Pass-Word"} className={inputClass} />
                  </label>
                )}
                {["register", "recovery", "invite"].includes(mode) && (
                  <label className="mt-5 block">
                    <span className="sr-only">Repeat password</span>
                    <input type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat Pass-Word" className={inputClass} />
                  </label>
                )}

                {mode === "login" && (
                  <button type="button" onClick={() => changeMode("forgot")} className="french-news mt-3 text-lg text-accent hover:underline">
                    Forgot Pass-Word?
                  </button>
                )}
                {error && <p className="mt-4 text-red-300" role="alert">{error}</p>}
                {message && <p className="mt-4 text-green-300" role="status">{message}</p>}

                <button type="submit" disabled={submitting} className="menu-btn-lg bourbonbase letterpress-button mx-auto mt-7 block px-8 py-3 text-xl text-accent disabled:cursor-wait disabled:opacity-60">
                  {submitting ? "Please Wait…" : title}
                </button>

                {mode === "login" && (
                  <p className="french-news mt-7 text-center text-lg">
                    New here?{" "}
                    <button type="button" onClick={() => changeMode("register")} className="text-accent hover:underline">Create an account</button>
                  </p>
                )}
                {mode !== "login" && !["recovery", "invite"].includes(mode) && (
                  <button type="button" onClick={() => changeMode("login")} className="french-news mx-auto mt-6 block text-lg text-accent hover:underline">Back to Log In</button>
                )}
              </form>
            )}
          </section>
        </main>
      </Layout>
    </>
  );
}
