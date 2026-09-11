import { useAuth } from "../../hooks/useAuth";

function CheckoutButton({ cartItems }) {
  const { user } = useAuth();

  if (cartItems.length === 0) return null;

  const handleCheckout = async () => {
    console.log("[💳] Starting checkout with:", cartItems);

    try {
      const checkoutRes = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartItems }),
      });

      const data = await checkoutRes.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe session failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong during checkout.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="menu-btn-lg bourbonbase letterpress-button w-full whitespace-nowrap px-4 py-3 text-lg text-accent sm:text-xl"
      aria-label="Proceed to checkout"
    >
      Check-Out Now
    </button>
  );
}

export default CheckoutButton;
