import "../styles/global.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/authContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}
