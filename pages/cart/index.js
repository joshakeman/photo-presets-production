import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import Layout from "../../components/layout";
import CheckoutButton from "../../components/checkout-button";
import PayPalCheckout from "../../components/paypalCheckout";
import PortmanteauCount from "../../components/portmanteau-count";
import Star from "../../public/images/assets/starette.webp";

export default function CartPage() {
  const { cart, removeFromCart, cartReady } = useCart();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
  const [paypalSdkError, setPaypalSdkError] = useState(false);

  const total = cart.reduce((sum, item) => {
    const quantity = item.quantity || 1;
    return sum + item.price * quantity;
  }, 0);

  return (
    <>
      <Head>
        <title>Portmanteau | Photo Presets</title>
        <meta
          name="description"
          content="Review the Photo Presets collections in your portmanteau and proceed to checkout."
        />
      </Head>

      <Layout
        backgroundColor="bg-backgroundBlueFaded"
        backgroundImage="bg-victorianPattern"
      >
        {paypalClientId && (
          <Script
            id="paypal-checkout-sdk"
            src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=USD&intent=capture&disable-funding=card`}
            strategy="afterInteractive"
            onLoad={() => {
              setPaypalSdkReady(true);
              setPaypalSdkError(false);
            }}
            onReady={() => {
              setPaypalSdkReady(true);
              setPaypalSdkError(false);
            }}
            onError={() => {
              setPaypalSdkReady(false);
              setPaypalSdkError(true);
            }}
          />
        )}

        <main className="mx-auto mt-24 w-full max-w-3xl pb-16 sm:mt-28">
          {/* <h1 className="french-news mb-5 text-center text-5xl text-black sm:text-7xl">
            Portmanteau
          </h1> */}

          <section className="min-h-[70vh] rounded-[2.5rem] border-2 border-accent bg-darkCard px-5 py-8 text-white shadow-cool-shadow sm:px-12 sm:py-12">
            <div className="mb-8 flex items-center justify-center gap-4 sm:gap-8">
              <Image src={Star} alt="" className="h-auto w-9 sm:w-12" />
              <PortmanteauCount
                count={cartReady ? cart.length : 0}
                className="w-32 sm:w-44"
                priority
              />
              <Image src={Star} alt="" className="h-auto w-9 sm:w-12" />
            </div>

            {!cartReady ? (
              <p className="french-news py-12 text-center text-2xl text-accent">
                Opening your portmanteau…
              </p>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center sm:py-14">
                <p className="french-news mb-8 text-2xl sm:text-3xl">
                  Your portmanteau is empty.
                </p>
                <Link
                  href="/#collections"
                  className="menu-btn-lg bourbonbase letterpress-button px-6 py-3 text-xl text-accent sm:text-2xl"
                >
                  Explore the Gallery
                </Link>
              </div>
            ) : (
              <>
                <ul
                  className="mx-auto max-w-xl space-y-5"
                  aria-label="Collections in your portmanteau"
                >
                  {cart.map((item, index) => (
                    <li
                      key={item.href || item.id || item.title || item.name}
                      className="grid grid-cols-[5.5rem_1fr] items-start gap-x-4 gap-y-2 border-b border-accent/40 pb-5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-6"
                    >
                      <div className="row-span-2 flex items-center justify-center sm:row-span-1">
                        {item.menuImage ? (
                          <img
                            src={item.menuImage}
                            alt={item.menuImageAlt || `${item.name || item.title} preview`}
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                        ) : (
                          <Image src={Star} alt="" className="h-auto w-10" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="french-news text-lg leading-tight text-accent sm:text-2xl">
                          {item.name || item.title}
                        </p>
                        {item.sets?.length > 0 && (
                          <p className="french-news mt-1 text-xs leading-snug text-white/80 sm:text-base">
                            {item.sets.map((set) => set.title).join(" · ")}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="mt-1 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
                          aria-label={`Remove ${item.name || item.title} from portmanteau`}
                        >
                          Remove
                        </button>
                      </div>

                      <span className="french-news col-start-2 row-start-2 self-end text-lg text-accent sm:col-auto sm:row-auto sm:self-center sm:text-2xl">
                        ${item.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mx-auto mt-8 max-w-xl border-t-2 border-accent pt-5">
                  <p className="french-news text-right text-4xl text-accent sm:text-5xl">
                    Total ${total.toFixed(2)}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Link
                      href="/#collections"
                      className="menu-btn-lg bourbonbase letterpress-button flex items-center justify-center px-4 py-3 text-center text-lg text-accent sm:text-xl"
                    >
                      Keep Exploring
                    </Link>
                    <CheckoutButton cartItems={cart} />
                  </div>

                  <div className="mt-8 border-t border-accent/40 pt-6">
                    <p className="french-news mb-4 text-center text-lg text-white/80">
                      Or check out with PayPal
                    </p>
                    {paypalClientId ? (
                      <PayPalCheckout
                        cartItems={cart}
                        sdkReady={paypalSdkReady}
                        sdkError={paypalSdkError}
                      />
                    ) : (
                      <p className="french-news text-center text-base text-white/60">
                        PayPal checkout is being prepared.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </Layout>
    </>
  );
}
