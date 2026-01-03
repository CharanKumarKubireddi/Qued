import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { ClerkProvider } from '@clerk/clerk-react'; // <--- Import Clerk

// Import key from .env
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}> {/* <--- Wrap App */}
      <CartProvider>
        <App />
      </CartProvider>
    </ClerkProvider>
  </React.StrictMode>,
);