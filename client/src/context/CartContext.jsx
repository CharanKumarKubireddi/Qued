import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on startup
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (course) => {
    // Prevent duplicates
    if (cart.find(item => item._id === course._id)) {
      return toast.error("Course already in cart");
    }
    setCart([...cart, course]);
    toast.success("Added to Cart");
  };

  const removeFromCart = (courseId) => {
    setCart(cart.filter(item => item._id !== courseId));
    toast.success("Removed from Cart");
  };

  // [NEW] Function to clear cart after purchase
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);