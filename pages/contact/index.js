import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Letter from "../../public/images/assets/letter.webp";
import Logo from "../../public/images/hero-image/logo-no-background.png";

const fieldClass =
  "french-news w-full border-2 border-transparent bg-white px-4 py-3 text-xl leading-normal text-black outline-none placeholder:text-gray-400 focus:border-accent sm:px-5 sm:py-4 sm:text-2xl";

const labelClass =
  "french-news mb-2 block text-base uppercase tracking-[0.12em] text-accent sm:text-lg";

export default function ContactPage() {
  const router = useRouter();
  const submitted = router.isReady && router.query.submitted === "true";
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmissionError("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) throw new Error("Your note could not be sent.");
      await router.push("/contact?submitted=true");
    } catch (error) {
      setSubmissionError(error.message || "Your note could not be sent. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Photo Presets</title>
        <meta
          name="description"
          content="Send a question to Photo Presets and we’ll get back to you as soon as we can."
        />
      </Head>

      <div className="min-h-screen bg-backgroundBlueFaded bg-victorianPattern bg-auto bg-repeat bg-blend-soft-light">
        <header className="grid min-h-[4.5rem] grid-cols-[5.5rem_1fr_4.5rem] items-center gap-2 bg-accent px-3 py-1 sm:min-h-36 sm:grid-cols-[12rem_1fr_10rem] sm:px-8 lg:px-14">
          <Link
            href="/"
            aria-label="Photo Presets home"
            className="w-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <Image src={Logo} alt="" className="h-auto w-full" priority />
          </Link>

          <h1 className="bourbonbase text-center text-5xl leading-none text-black sm:text-7xl lg:text-8xl">
            Contact
          </h1>

          <Image
            src={Letter}
            alt=""
            className="h-auto w-full object-contain"
            priority
          />
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-5 sm:px-10 sm:py-8 lg:pb-20">
          <section className="rounded-[2.25rem] border-2 border-accent bg-darkCard px-6 py-8 text-center text-white shadow-cool-shadow sm:rounded-[2.75rem] sm:px-16 sm:py-12">
            <Image
              src={Letter}
              alt="A vintage addressed envelope"
              className="mx-auto h-auto w-44 rotate-[14deg] sm:w-64"
            />

            <div className="mx-auto mt-6 max-w-xl sm:mt-8">
              <h2 className="bourbonbase text-4xl leading-[1.15] text-accent sm:text-5xl">
                Send Us a Note
              </h2>
              <p className="french-news mt-4 text-lg leading-[1.65] text-white/85 sm:text-2xl sm:leading-[1.6]">
                If we haven’t answered your question in our{" "}
                <Link
                  href="/manual"
                  className="text-[#e4a64f] underline decoration-1 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Manual
                </Link>
                , write to us here and we’ll get back to you as soon as we can.
              </p>
            </div>

            {submitted ? (
              <div className="mx-auto mt-10 max-w-xl border-y border-accent/60 py-10" role="status">
                <h2 className="bourbonbase text-4xl text-accent sm:text-5xl">
                  Your message is on its way.
                </h2>
                <p className="french-news mt-4 text-xl sm:text-2xl">
                  Thank you for writing. We’ll get back to you as soon as we can.
                </p>
                <Link
                  href="/contact"
                  className="menu-btn-lg bourbonbase letterpress-button mx-auto mt-7 inline-block px-7 py-3 text-xl text-accent"
                >
                  Send Another
                </Link>
              </div>
            ) : (
              <form
                name="contact"
                onSubmit={handleSubmit}
                className="mx-auto mt-8 max-w-xl space-y-5 border-t border-accent/40 pt-8 text-left sm:mt-10 sm:pt-10"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>
                    Don’t fill this out if you’re human:{" "}
                    <input name="bot-field" />
                  </label>
                </p>

                <label className="block">
                  <span className={labelClass}>Name</span>
                  <input
                    className={fieldClass}
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>E-mail</span>
                  <input
                    className={fieldClass}
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Question</span>
                  <textarea
                    className={`${fieldClass} min-h-44 resize-y sm:min-h-56`}
                    name="question"
                    placeholder="How can we help?"
                    required
                  />
                </label>

                {submissionError && (
                  <p className="french-news text-lg text-red-300" role="alert">
                    {submissionError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="menu-btn-lg bourbonbase letterpress-button mx-auto block w-full px-10 py-4 text-xl text-accent sm:w-auto sm:min-w-64 sm:text-2xl"
                >
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
