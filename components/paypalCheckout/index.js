import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/authContext";

export default function PayPalCheckout({ cartItems }) {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const containerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.paypal || !containerRef.current || !authReady || !user) return;
    containerRef.current.innerHTML = "";

    const buttons = window.paypal
        .Buttons({
          createOrder: async () => {
            setError("");
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cartItems.map((item) => item.slug || item.href),
              }),
            });
            const data = await response.json();
            if (!response.ok || !data.id) throw new Error(data.error || "Unable to start PayPal checkout");
            return data.id;
          },
          onApprove: async (data) => {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
            const result = await response.json();
            if (!response.ok || result.status !== "COMPLETED") {
              throw new Error(result.error || "PayPal could not confirm the payment");
            }
            await router.push("/success?provider=paypal");
          },
          onError: (checkoutError) => {
            console.error("PayPal checkout error:", checkoutError);
            setError(checkoutError?.message || "PayPal checkout could not be completed.");
          },
        })
        .render(containerRef.current);

    return () => {
      buttons?.close?.();
    };
  }, [authReady, user, cartItems, router]);

  if (!user) {
    return <p className="french-news text-center text-base text-white/75">Log in to use PayPal.</p>;
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && <p className="mt-2 text-center text-sm text-red-300" role="alert">{error}</p>}
    </div>
  );
}
