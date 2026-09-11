import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  const cartKey = user ? `cart-${user.id}` : "cart-guest";
  const [loadedCartKey, setLoadedCartKey] = useState(null);
  const cartReady = loadedCartKey === cartKey;

  // Load cart from localStorage when user changes
  useEffect(() => {
    setLoadedCartKey(null);

    try {
      const savedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
    }

    setLoadedCartKey(cartKey);
  }, [cartKey]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, cartReady]);

  const itemKey = (item) => item.id || item.href || item.slug || item.title || item.name;

  const isInCart = (item) => {
    const key = itemKey(item);
    return Boolean(key) && cart.some((cartItem) => itemKey(cartItem) === key);
  };

  const addToCart = (item) => {
    const key = itemKey(item);
    if (!key || isInCart(item)) return false;

    setCart((prevCart) => [
      ...prevCart,
      {
        ...item,
        name: item.name || item.title,
        quantity: 1,
      },
    ]);
    return true;
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        user,
        cartReady,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
