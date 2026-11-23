import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/layout";
import { useCart } from "../../context/CartContext";

export default function CheckoutSuccessPage() {
  const { clearCart, cartReady } = useCart();

  useEffect(() => {
    if (cartReady) clearCart();
  }, [cartReady]);

  return (
    <>
      <Head>
        <title>Thank You | Photo Presets</title>
      </Head>
      <Layout
        backgroundColor="bg-backgroundBlueFaded"
        backgroundImage="bg-victorianPattern"
      >
        <main className="mx-auto mt-28 w-full max-w-2xl rounded-[2.5rem] border-2 border-accent bg-darkCard px-6 py-14 text-center text-white shadow-cool-shadow sm:px-12">
          <h1 className="french-news text-5xl text-accent sm:text-6xl">
            Thank You
          </h1>
          <p className="french-news mx-auto mt-6 max-w-lg text-xl sm:text-2xl">
            Your checkout is complete. Your purchased presets will be available through your account.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/downloads" className="menu-btn-lg bourbonbase letterpress-button px-6 py-3 text-xl text-accent">
              Open Your Library
            </Link>
            <Link href="/#collections" className="menu-btn-lg bourbonbase letterpress-button px-6 py-3 text-xl text-accent">
              Keep Exploring
            </Link>
          </div>
        </main>
      </Layout>
    </>
  );
}
