"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { orderApi, cartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const { activeBookingId, setActiveBookingId } = useBookingStore();
  const isLoggedIn = !!user;
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToRefunds, setAgreedToRefunds] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getSubtotal();
  const total = subtotal;

  useEffect(() => {
    // If cart is empty and we haven't just placed an order, redirect to home
    if (items.length === 0 && !orderPlaced) {
      router.push("/");
    }
  }, [items, router, orderPlaced]);

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setIsProcessing(true);
      
      // Sync local cart to backend to ensure backend has the items before checkout
      try {
        try { await cartApi.clearCart(); } catch (e) { /* ignore if empty */ }
        const validItems = items.filter(item => item?.product?.id);
        for (const item of validItems) {
          await cartApi.addToCart({
            productId: item.product.id,
            quantity: item.quantity
          });
        }
      } catch (syncErr) {
        console.error("Failed to sync cart before checkout", syncErr);
      }

      const res = await orderApi.checkout({ paymentMethod, bookingId: activeBookingId || undefined });
      
      setOrderPlaced(true);
      useCartStore.getState().clearCart();

      toast.success(activeBookingId ? "Food added to your booking! Redirecting..." : "Order placed successfully! Redirecting to payment...", {
        style: {
          background: '#1A1A1A',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        },
        iconTheme: { primary: '#C5A059', secondary: '#fff' },
      });

      // If booking is active, redirect to combined payment; otherwise food-only payment
      if (activeBookingId) {
        router.push(`/payment/booking/${activeBookingId}`);
        setActiveBookingId(null);
      } else {
        router.push(`/payment/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to place order.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Handled by redirect
  }

  return (
    <div className="min-h-screen bg-bg-deep">
      <Navbar />
      <div className="pt-[120px] pb-[80px] max-w-[1200px] mx-auto px-[24px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[32px]"
        >
          <Link href="/" className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-[clamp(2rem,3vw,2.5rem)] font-[800] text-text-white">
            Secure <span className="gradient-text">Checkout</span>
          </h1>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-[40px]">
          {/* Left Column: Review Items & Payment */}
          <div className="flex-1 flex flex-col gap-[32px]">
            {/* Login Prompt if not logged in */}
            {!isLoggedIn && (
              <div className="bg-red-50 border border-red-200 rounded-[16px] p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
                <div>
                  <h3 className="font-[600] text-red-600 text-[1.1rem] mb-[4px]">Sign in to proceed</h3>
                  <p className="text-red-500 text-[0.9rem]">You need an account to track your orders and manage bookings.</p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="whitespace-nowrap px-[24px] py-[10px] rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-[600] transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-[24px] shadow-sm">
              <h2 className="font-heading text-[1.2rem] font-[700] text-text-white mb-[24px] border-b border-gray-200 pb-[16px]">
                Order Review
              </h2>
              <div className="flex flex-col gap-[16px]">
                {items
                  .filter((item) => item?.product)
                  .map((item) => (
                  <div key={item.product.id} className="flex gap-[16px]">
                    <div className="w-[60px] h-[60px] rounded-[8px] bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.product.image || "/images/menu/masala_chai.png"} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-[600] text-text-white text-[0.95rem]">{item.product.name}</h4>
                      <p className="text-text-muted text-[0.85rem]">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col justify-center items-end">
                      <p className="font-[600] text-gold">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-[24px] shadow-sm">
              <h2 className="font-heading text-[1.2rem] font-[700] text-text-white mb-[24px] border-b border-gray-200 pb-[16px]">
                Payment Method
              </h2>
              <div className="flex flex-col gap-[12px]">
                <label className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-gold bg-yellow-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}>
                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${paymentMethod === "ONLINE" ? "border-gold" : "border-gray-400"}`}>
                    {paymentMethod === "ONLINE" && <div className="w-[10px] h-[10px] rounded-full bg-gold" />}
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <h4 className="font-[600] text-text-white">Pay Online</h4>
                    <p className="text-text-muted text-[0.85rem]">UPI, Credit/Debit Cards, NetBanking via Razorpay</p>
                  </div>
                  <div className="text-[1.5rem]">💳</div>
                </label>

                <label className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border cursor-pointer transition-all ${paymentMethod === "OFFLINE" ? "border-gold bg-yellow-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}>
                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${paymentMethod === "OFFLINE" ? "border-gold" : "border-gray-400"}`}>
                    {paymentMethod === "OFFLINE" && <div className="w-[10px] h-[10px] rounded-full bg-gold" />}
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="OFFLINE"
                    checked={paymentMethod === "OFFLINE"}
                    onChange={() => setPaymentMethod("OFFLINE")}
                    className="hidden"
                  />
                  <div className="flex-1">
                    <h4 className="font-[600] text-text-white">Pay at Counter</h4>
                    <p className="text-text-muted text-[0.85rem]">Pay when your order is ready</p>
                  </div>
                  <div className="text-[1.5rem]">💵</div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="bg-white border-2 border-gray-200 rounded-[20px] p-[24px] sticky top-[120px] shadow-sm">
              <h2 className="font-heading text-[1.2rem] font-[700] text-text-white mb-[24px]">
                Order Summary
              </h2>
              
              <div className="flex flex-col gap-[16px] mb-[24px]">
                <div className="flex justify-between text-text-white font-[700] text-[1.2rem]">
                  <span>Total</span>
                  <span className="text-gold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start gap-[8px] mb-[16px]">
                <input 
                  type="checkbox" 
                  id="checkout-refund-consent"
                  className="mt-1 cursor-pointer accent-gold"
                  checked={agreedToRefunds}
                  onChange={(e) => setAgreedToRefunds(e.target.checked)}
                />
                <label htmlFor="checkout-refund-consent" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the <a href="/refunds" target="_blank" className="text-gold hover:underline">Refund Policy</a>.
                </label>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !isLoggedIn || !agreedToRefunds}
                className="w-full py-[14px] rounded-[14px] font-heading font-[700] text-[1.05rem] transition-all duration-300 border border-[rgba(255,209,102,0.15)] bg-gold text-white shadow-md hover:shadow-lg hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Place Order ✦"}
              </button>
              
              {!isLoggedIn && (
                <p className="text-center text-red-400 text-[0.85rem] mt-[12px]">
                  Please sign in to complete your order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
