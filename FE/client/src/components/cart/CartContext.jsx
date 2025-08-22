import React, { createContext, useState, useEffect, useContext } from "react";

import { useAuth } from '../context/authcontext';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return; 
      try {
        const res = await fetch(`http://localhost:5000/api/cart/user/${user._id}`);
        const result = await res.json();
        if (result.success) {
          setCartItems(result.data.cartItems);
          setCartCount(result.data.summary.totalItems);
        }
      } catch (err) {
        console.error("Fetch cart failed:", err);
      }
    };

    fetchCart();
  }, [user]);


  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${user._id}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await res.json();

      console.log("result:", result);

      if (result.success) {
        setCartItems(result.data.items);
        setCartCount(result.data.totalItems);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, setCartCount, addToCart }}>
    {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
