import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import toast from 'react-hot-toast';

const CartPage = ({ user }) => {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- FIX 1: Correct Logic to Remove Enrolled Courses ---
  useEffect(() => {
    const cleanCart = async () => {
      // Only check if user is logged in and cart has items
      if (!user || cart.length === 0) return;

      try {
        const token = await getToken();
        
        // ✅ CHANGED: Use '/api/me' because '/api/student/enrolled-courses' doesn't exist
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle if enrolledCourses is array of strings (IDs) or Objects
        const enrolledList = data.enrolledCourses || [];
        const enrolledIds = new Set(enrolledList.map(item => 
            typeof item === 'string' ? item : item._id
        ));

        // Check and remove duplicates
        let removedCount = 0;
        cart.forEach(item => {
          if (enrolledIds.has(item._id)) {
            removeFromCart(item._id);
            removedCount++;
          }
        });

        // Notify user if items were removed
        if (removedCount > 0) {
          toast.success(`Removed ${removedCount} course(s) you already own.`);
        }

      } catch (error) {
        console.error("Error verifying cart items:", error);
      }
    };

    cleanCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 
  // ---------------------------------------------------

  // 1. Calculate Fees
  const platformFee = Math.round(cartTotal * 0.07); // 7% Fee
  const finalTotal = cartTotal + platformFee;

  // 2. Load Razorpay Script Helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 3. Handle Checkout Flow (✅ FIXED RACE CONDITION)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const token = await getToken();
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // A. Create Order on Backend
      const courseIds = cart.map(item => item._id);
      
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/checkout`, 
        { courseIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Capture orderId here to use as fallback
      const { orderId, amount } = orderRes.data;

      // B. Open Razorpay Modal
      const options = {
        key: "rzp_test_Rx7exkp3lmF0cN", // Your Key ID
        amount: amount * 100,
        currency: "INR",
        name: "Qued", 
        description: `Payment for ${cart.length} Courses`,
        order_id: orderId,
        handler: async function (response) {
            // C. On Success: Verify Payment on Backend
            try {
              console.log("Razorpay Response:", response); // Debug log

              await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
                 // ✅ CRITICAL FIX: Use 'orderId' if razorpay_order_id is undefined
                 razorpay_order_id: response.razorpay_order_id || orderId,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 courseIds 
              }, { headers: { Authorization: `Bearer ${token}` } });

              toast.success("Payment Successful! Enrolled in courses.");
              clearCart();
              navigate('/dashboard'); 
            } catch (verifyErr) {
              console.error("Verification Error:", verifyErr);
              toast.error("Payment Verification Failed. Contact Support.");
            }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#2563EB", 
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
            <ShoppingCart size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any courses yet.</p>
          <Link to="/courses">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full">
              Browse Courses
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingCart /> Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CART ITEMS LIST */}
          <div className="lg:w-2/3 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-xl text-blue-600 mb-2">₹{item.price}</p>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    title="Remove"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:w-1/3 h-fit">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                {/* 7% Fee Display */}
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-1">
                      <span>Platform Fee (7%)</span>
                      <div className="group relative">
                          <ShieldCheck size={14} className="text-gray-400 cursor-pointer"/>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-xs rounded hidden group-hover:block">
                            Convenience fee for platform maintenance.
                          </div>
                      </div>
                  </div>
                  <span>₹{platformFee}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-gray-900">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (
                  <>
                    Pay Now <ArrowRight size={20} />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <CreditCard size={14} /> Secured by Razorpay
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;