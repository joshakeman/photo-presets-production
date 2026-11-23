import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const primaryLinks = [
  ["Home", "/"],
  ["Account", "/account"],
  ["Gallery", "/#collections"],
  ["Manual", "/manual"],
  ["Portmanteau", "/cart"],
];

function Ornament() {
  return (
    <Image
      src="/images/assets/starette.webp"
      alt=""
      width={52}
      height={52}
      className="hidden h-10 w-10 object-contain xl:block"
    />
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function subscribe(event) {
    event.preventDefault();
    setStatus("sending");

    try {
      const body = new URLSearchParams({
        "form-name": "newsletter",
        email,
      });
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) throw new Error("Subscription failed");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="border-t-2 border-accent bg-black text-accent">
      <div className="mx-auto grid max-w-screen-2xl gap-7 px-6 py-7 sm:grid-cols-[minmax(7rem,.75fr)_minmax(8rem,1fr)_minmax(14rem,1.35fr)] sm:items-center sm:gap-4 sm:px-7 sm:py-5 lg:gap-8 lg:px-12">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Link href="/" aria-label="Photo Presets home">
            <Image
              src="/images/hero-image/logo-no-background.png"
              alt="Photo Presets"
              width={190}
              height={126}
              className="h-auto w-28 sm:w-24 lg:w-32"
            />
          </Link>

          <div className="flex gap-3" aria-label="Social media links coming soon">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-serif text-xl font-bold text-black lg:h-10 lg:w-10" aria-label="Facebook">f</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-base text-black lg:h-10 lg:w-10" aria-label="X">X</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-2xl text-black lg:h-10 lg:w-10" aria-label="Instagram">◎</span>
          </div>
        </div>

        <div className="grid grid-cols-[auto_minmax(8rem,auto)_auto] items-center justify-center gap-5 xl:gap-8">
          <Ornament />
          <nav aria-label="Footer navigation">
            <ul className="bourbonbase space-y-1 text-center text-lg uppercase leading-none lg:text-xl">
              {primaryLinks.map(([label, href]) => (
                <li key={href}>
                  <Link className="transition-colors hover:text-white focus-visible:text-white" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Ornament />
        </div>

        <div className="flex flex-col items-center text-center sm:items-end sm:text-right">
          <div className="absintheaged text-xl leading-none text-accent lg:text-2xl">
            <p>Terms of Use</p>
            <p>Refund Policy</p>
            <Link className="block transition-colors hover:text-white focus-visible:text-white" href="/contact">Contact</Link>
          </div>

          <form className="mt-3 w-full max-w-xs" onSubmit={subscribe}>
            <label className="absintheaged block text-lg leading-none lg:text-xl" htmlFor="footer-email">
              Subscribe for special offers
            </label>
            <div className="mt-2 flex">
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="E-mail"
                className="french-news min-w-0 flex-1 border-2 border-white bg-white px-3 py-1.5 text-base text-black outline-none focus:border-accent lg:text-lg"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="bourbonbase border-2 border-l-0 border-white bg-accent px-3 text-base text-black transition-colors hover:bg-white disabled:opacity-60 lg:px-4 lg:text-lg"
              >
                Join
              </button>
            </div>
            <p className="french-news mt-1 min-h-4 text-sm" aria-live="polite">
              {status === "success" && "Your name is on the list!"}
              {status === "error" && "The telegraph faltered—please try again."}
            </p>
          </form>
        </div>
      </div>

      <p className="french-news border-t border-accent/30 px-6 py-2 text-center text-sm text-accent/75 sm:text-base">
        Copyright © {new Date().getFullYear()} Photo Presets
      </p>
    </footer>
  );
}
