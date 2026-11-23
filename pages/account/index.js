import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/authContext";
import Hat from "../../public/images/assets/hat.png";
import Star from "../../public/images/assets/starette.webp";
import Logo from "../../public/images/hero-image/logo-no-background.png";

const inputClass =
  "french-news w-full border-2 border-transparent bg-white px-4 py-3 text-xl leading-normal text-black outline-none placeholder:text-gray-400 focus:border-accent sm:px-5 sm:py-4 sm:text-2xl";

const labelClass =
  "french-news mb-2 block text-base uppercase tracking-[0.12em] text-accent sm:text-lg";

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
      <div className="min-h-screen bg-backgroundBlueFaded bg-victorianPattern bg-auto bg-repeat bg-blend-soft-light">
        <header className="grid min-h-[4.5rem] grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 bg-accent px-3 py-1 sm:min-h-36 sm:grid-cols-[12rem_1fr_8rem] sm:px-8 lg:px-14">
          <Link
            href="/"
            aria-label="Photo Presets home"
            className="w-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <Image src={Logo} alt="" className="h-auto w-full" priority />
          </Link>
          <h1 className="bourbonbase text-center text-5xl leading-none text-black sm:text-7xl lg:text-8xl">
            Account
          </h1>
          <Image src={Hat} alt="" className="mx-auto h-14 w-auto object-contain sm:h-24" priority />
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-5 pb-16 sm:px-10 sm:py-8">
          <section className="rounded-[2.25rem] border-2 border-accent bg-darkCard px-6 py-9 text-white shadow-cool-shadow sm:rounded-[2.75rem] sm:px-16 sm:py-12">
            <div className="mb-7 flex items-center justify-center gap-6 sm:mb-9 sm:gap-10">
              <Image src={Star} alt="" className="hidden h-auto w-20 sm:block" />
              <Image src={Hat} alt="A vintage top hat" className="h-auto w-32 sm:w-44" priority />
              <Image src={Star} alt="" className="hidden h-auto w-20 sm:block" />
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
                <h2 className="bourbonbase mb-7 text-center text-4xl leading-[1.15] text-accent sm:text-5xl">
                  {title}
                </h2>
                {["login", "register", "forgot"].includes(mode) && (
                  <label className="block">
                    <span className={labelClass}>E-mail</span>
                    <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={inputClass} />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label className="mt-5 block">
                    <span className={labelClass}>{mode === "login" ? "Pass-Word" : "Choose Pass-Word"}</span>
                    <input type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className={inputClass} />
                  </label>
                )}
                {["register", "recovery", "invite"].includes(mode) && (
                  <label className="mt-5 block">
                    <span className={labelClass}>Repeat Pass-Word</span>
                    <input type="password" required minLength={6} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" className={inputClass} />
                  </label>
                )}

                {mode === "login" && (
                  <button type="button" onClick={() => changeMode("forgot")} className="french-news mt-3 text-lg text-accent hover:underline">
                    Forgot Pass-Word?
                  </button>
                )}
                {error && <p className="mt-4 text-red-300" role="alert">{error}</p>}
                {message && <p className="mt-4 text-green-300" role="status">{message}</p>}

                <button type="submit" disabled={submitting} className="menu-btn-lg bourbonbase letterpress-button mx-auto mt-7 block w-full px-8 py-4 text-xl text-accent disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-56 sm:text-2xl">
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
      </div>
    </>
  );
}
