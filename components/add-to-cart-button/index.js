import { useCart } from "../../context/CartContext";

export default function AddToCartButton({ item }) {
  const { addToCart, isInCart, cartReady } = useCart();
  const added = isInCart(item);

  return (
    <button
      onClick={() => addToCart(item)}
      disabled={!cartReady || added}
      aria-live="polite"
      className={`w-full bg-accent text-black border-2 border-black py-2 px-4 transition-all ${
        added ? "bg-green-700 text-white border-green-900 cursor-default" : "hover:brightness-110"
      }`}
    >
      {added ? "In Portmanteau" : "Add to Portmanteau"}
    </button>
  );
}
