import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import MenuButton from "../../public/images/assets/menu.webp";
import Portmanteau from "../../public/images/assets/portmanteau.webp";
import Hat from "../../public/images/assets/hat.png";
import Brush from "../../public/images/assets/brush.webp";
import Manual from "../../public/images/assets/manual.webp";
import Letter from "../../public/images/assets/letter.webp";
import Search from "../../public/images/assets/search.webp";
import Logo from "../../public/images/hero-image/logo-no-background.png";

const menuItems = [
  { label: "Account", href: "/orders", image: Hat },
  { label: "Presets Gallery", href: "/#collections", image: Brush },
  { label: "Portmanteau", href: "/cart", image: Portmanteau },
  { label: "Manual", href: "/manual", image: Manual },
  { label: "Contact", href: "/contact", image: Letter },
];

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className="relative z-20 -mb-20 flex w-full items-center justify-between sm:-mb-24 lg:-mb-28"
        aria-label="Primary navigation"
      >
        <button
          type="button"
          className="w-[20%] max-w-56 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="Open main menu"
          aria-expanded={isOpen}
          aria-controls="main-menu-overlay"
          onClick={() => setIsOpen(true)}
        >
          <Image className="h-auto w-full" src={MenuButton} alt="" priority />
        </button>

        <Link href="/cart" className="w-[15%] max-w-44" aria-label="View portmanteau">
          <Image className="h-auto w-full" src={Portmanteau} alt="" priority />
        </Link>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="main-menu-overlay"
            className="fixed inset-0 z-50 overflow-y-auto bg-backgroundBlue bg-victorianPattern bg-repeat bg-blend-soft-light shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            initial={reduceMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.7 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
          <header className="sticky top-0 z-10 flex min-h-24 items-center justify-between bg-accent px-4 py-2 sm:min-h-32 sm:px-8">
            <Link href="/" onClick={() => setIsOpen(false)} aria-label="Photo Presets home">
              <Image src={Logo} alt="" className="h-auto w-20 sm:w-32" priority />
            </Link>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="bourbonbase text-center text-3xl text-black sm:text-5xl lg:text-7xl"
            >
              Photo Presets
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="group relative w-16 sm:w-24"
              aria-label="Close main menu"
            >
              <Image src={Search} alt="" className="h-20 w-full object-contain sm:h-28" />
              <span className="absolute inset-0 flex items-center justify-center text-4xl font-light text-black opacity-0 transition-opacity group-hover:opacity-100">
                ×
              </span>
            </button>
          </header>

          <nav className="mx-auto flex w-full max-w-xl flex-col gap-3 px-8 py-10 sm:gap-5 sm:py-16" aria-label="Main menu links">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group grid grid-cols-[6rem_1fr] items-center gap-4 rounded-xl px-2 py-1 transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:grid-cols-[9rem_1fr] sm:gap-8"
              >
                <span className="flex h-20 items-center justify-center sm:h-28">
                  <Image
                    src={item.image}
                    alt=""
                    className="max-h-full w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </span>
                <span className="french-news text-2xl text-black sm:text-4xl">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
