import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/authContext";

function CheckoutButton({ cartItems }) {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (cartItems.length === 0) return null;

  const handleCheckout = async () => {
    if (!user) {
      router.push("/account?returnTo=/cart");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => item.slug || item.href),
        }),
      });
      const data = await checkoutRes.json();

      if (!checkoutRes.ok || !data.url) {
        throw new Error(data.error || "Unable to start checkout");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      console.error("Checkout error:", checkoutError);
      setError(checkoutError.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading || !authReady}
        className="menu-btn-lg bourbonbase letterpress-button w-full whitespace-nowrap px-4 py-3 text-lg text-accent disabled:cursor-wait disabled:opacity-60 sm:text-xl"
        aria-label="Proceed to checkout"
      >
        {isLoading ? "Opening Stripe…" : "Check-Out Now"}
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default CheckoutButton;
