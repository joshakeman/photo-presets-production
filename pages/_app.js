import "../styles/global.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/authContext";
import Footer from "../components/footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
