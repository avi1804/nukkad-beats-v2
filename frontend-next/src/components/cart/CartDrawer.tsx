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
        useCartStore.getState().clearCart();
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1050]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white border-l border-glass-border shadow-[-10px_0_40px_rgba(0,0,0,0.08)] z-[1100] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-glass-border bg-white">
              <h2 className="font-heading text-[1.4rem] font-[700] text-text-white flex items-center gap-[8px]">
                <span>🛒</span> Your Cart
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-text-muted transition-colors"
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
                  <p className="text-[1.1rem] font-[500] text-text-white mb-[8px]">Your cart is empty</p>
                  <p className="text-[0.9rem]">Add some delicious items from our Café.</p>
                </div>
              ) : (
                validItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-[16px] p-[16px] rounded-[16px] bg-white border border-glass-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] relative group transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="absolute top-[8px] right-[8px] w-[24px] h-[24px] flex items-center justify-center rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 text-[0.8rem]"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>

                    <div className="w-[80px] h-[80px] rounded-[10px] overflow-hidden bg-gray-50 flex-shrink-0">
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
                        <div className="flex items-center bg-gray-50 rounded-[100px] overflow-hidden border border-glass-border">
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
                            className="w-[28px] h-[28px] flex items-center justify-center text-text-muted hover:bg-gray-200 hover:text-text-white transition-colors"
                          >
                            −
                          </button>
                          <span className="w-[24px] text-center text-[0.85rem] font-[600] text-text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-[28px] h-[28px] flex items-center justify-center text-text-muted hover:bg-gray-200 hover:text-text-white transition-colors"
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
              <div className="p-[24px] bg-white border-t border-glass-border shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-[24px] text-text-white font-[700] text-[1.2rem]">
                  <span>Total</span>
                  <span className="text-gold">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-full py-[14px] text-[1.05rem]"
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
