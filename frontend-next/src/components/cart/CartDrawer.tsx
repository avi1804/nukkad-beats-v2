"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { orderApi, cartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    syncWithServer,
    clearCart,
  } = useCartStore();
  const { activeBookingId, setActiveBookingId } = useBookingStore();
  const router = useRouter();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setCartOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const subtotal = getSubtotal();
  const total = subtotal;
  const validItems = items.filter((item) => item?.product);

  const handleCheckout = async () => {
    if (activeBookingId) {
      try {
        // Sync local cart to backend
        try { await cartApi.clearCart(); } catch (e) { /* ignore if empty */ }
        for (const item of validItems) {
          await cartApi.addToCart({
            productId: item.product.id,
            quantity: item.quantity
          });
        }
        
        await orderApi.checkout({ paymentMethod: "OFFLINE", bookingId: activeBookingId });
        
        toast.success("Food added to your booking! 🎉");
        clearCart();
        setCartOpen(false);
        router.push(`/payment/booking/${activeBookingId}`);
        setActiveBookingId(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to process food order.");
      }
    } else {
      setCartOpen(false);
      router.push("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-[#0B0B0F]/80 backdrop-blur-[4px] z-[1050]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-bg-deep border-l border-glass-border shadow-[-10px_0_40px_rgba(0,0,0,0.5)] z-[1100] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-glass-border bg-glass-bg">
              <h2 className="font-heading text-[1.4rem] font-[700] text-text-white flex items-center gap-[8px]">
                <span>🛒</span> Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-light transition-colors"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[16px] custom-scrollbar">
              {validItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-text-muted opacity-80">
                  <span className="text-[4rem] mb-[16px]">🛍️</span>
                  <p className="text-[1.1rem] font-[500] text-text-light mb-[8px]">Your cart is empty</p>
                  <p className="text-[0.9rem]">Add some delicious items from our Café.</p>
                </div>
              ) : (
                validItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-[16px] p-[16px] rounded-[16px] bg-white/5 border border-white/5 relative group"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="absolute top-[8px] right-[8px] w-[24px] h-[24px] flex items-center justify-center rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-[0.8rem]"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>

                    <div className="w-[80px] h-[80px] rounded-[10px] overflow-hidden bg-black/40 flex-shrink-0">
                      <img
                        src={item.product.image || "/images/menu/masala_chai.png"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-heading font-[600] text-text-white text-[1rem] leading-[1.2] pr-[16px]">
                          {item.product.name}
                        </h4>
                        <p className="text-gold font-[600] text-[0.9rem] mt-[4px]">
                          ₹{item.product.price}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-[10px]">
                        {/* Qty Control */}
                        <div className="flex items-center bg-[rgba(255,255,255,0.08)] rounded-[100px] overflow-hidden border border-white/10">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                if (confirm("Remove item from cart?")) {
                                  removeFromCart(item.product.id);
                                }
                              } else {
                                updateQuantity(item.product.id, item.quantity - 1);
                              }
                            }}
                            className="w-[28px] h-[28px] flex items-center justify-center text-text-light hover:bg-white/10 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-[24px] text-center text-[0.85rem] font-[600]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-[28px] h-[28px] flex items-center justify-center text-text-light hover:bg-white/10 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-[600] text-text-white text-[0.95rem]">
                          ₹{item.product.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {validItems.length > 0 && (
              <div className="p-[24px] bg-glass-bg border-t border-glass-border">
                <div className="flex justify-between items-center mb-[24px] text-text-white font-[700] text-[1.2rem]">
                  <span>Total</span>
                  <span className="text-gold">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-[14px] rounded-[14px] font-heading font-[700] text-[1.05rem] transition-all duration-300 border border-[rgba(255,209,102,0.15)] bg-[#FFD166] text-[#210B2C] shadow-[0_8px_24px_rgba(255,209,102,0.18)] hover:bg-[#F4C852] hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(255,209,102,0.25)] active:translate-y-0"
                >
                  {activeBookingId ? "Add to Booking & Pay ✦" : "Proceed to Checkout ✦"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
