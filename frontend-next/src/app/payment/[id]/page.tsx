"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import Link from "next/link";

export default function QRPaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderById(id as string);

        // If this order is attached to a studio booking, redirect to the combined payment page
        if (res.data.bookingId) {
          router.replace(`/payment/booking/${res.data.bookingId}`);
          return;
        }

        setOrder(res.data);
      } catch (err) {
        toast.error("Failed to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold mb-4">Order not found</h2>
        <button onClick={() => router.push("/")} className="text-gold underline">Return Home</button>
      </div>
    );
  }

  // Use a fixed UPI ID for demonstration, or dynamic if available.
  const upiId = "manika.saini2020-2@okhdfcbank";
  const amount = order.totalAmount.toFixed(2);
  const upiLink = `upi://pay?pa=${upiId}&pn=Nukkad%20Beats&am=${amount}&cu=INR&tn=Order%20${order.orderReference}`;

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      <Navbar />
      <div className="flex-1 pt-[120px] pb-[80px] max-w-[800px] mx-auto px-[24px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[32px]"
        >
          <Link href="/checkout" className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back to Checkout
          </Link>
          <h1 className="font-heading text-[clamp(2rem,3vw,2.5rem)] font-[800] text-text-white text-center">
            Complete <span className="gradient-text">Payment</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-glass-bg border border-glass-border rounded-[24px] p-[32px] md:p-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-gold via-[#FFD166] to-gold"></div>

          <div className="flex flex-col md:flex-row gap-[40px] items-center md:items-start">
            {/* Left: QR Code */}
            <div className="flex flex-col items-center flex-1">
              <h3 className="text-white font-[600] text-[1.2rem] mb-[24px]">Scan to Pay</h3>
              <div className="bg-white p-[12px] rounded-[16px] shadow-[0_10px_30px_rgba(255,209,102,0.15)] mb-[24px] w-full max-w-[260px] aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src="/images/qr.jpg"
                  alt="Scan to Pay"
                  className="w-full h-full object-contain rounded-[8px]"
                />
              </div>
              <div className="flex flex-col items-center gap-[8px] mb-[24px] w-full">
                <span className="text-text-muted text-[0.9rem]">Or pay via UPI ID</span>
                <div className="flex items-center gap-[12px] bg-white/5 border border-white/10 rounded-[12px] py-[10px] px-[16px] w-full max-w-[240px] justify-between">
                  <span className="text-white font-[600] tracking-wider">{upiId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(upiId);
                      toast.success("UPI ID copied!");
                    }}
                    className="text-gold text-[0.85rem] font-[600] uppercase hover:opacity-80 transition-opacity"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="flex-1 w-full flex flex-col">
              <div className="bg-white/5 border border-white/10 rounded-[16px] p-[24px] flex-1">
                <h3 className="text-white font-[700] text-[1.1rem] mb-[20px] border-b border-white/10 pb-[12px]">Order Summary</h3>

                <div className="flex flex-col gap-[12px] mb-[24px]">
                  <div className="flex justify-between">
                    <span className="text-text-light">Order ID</span>
                    <span className="font-[600] text-white">{order.orderReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Customer</span>
                    <span className="font-[600] text-white">{user?.fullName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Items</span>
                    <span className="font-[600] text-white">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] mb-[24px] max-h-[150px] overflow-y-auto scrollbar-hide pr-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-[0.9rem]">
                      <span className="text-text-muted flex-1 pr-4 truncate">{item.quantity}x {item.product?.name}</span>
                      <span className="text-white">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-[20px] border-t border-white/10 flex justify-between items-center">
                  <span className="text-white font-[600] text-[1.1rem]">Total Amount</span>
                  <span className="text-gold font-[800] text-[1.5rem]">₹{amount}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-[24px] text-[0.85rem] text-text-muted bg-burgundy/10 border border-burgundy/20 rounded-[12px] p-[16px]">
                <p className="flex items-start gap-[8px] mb-[8px]">
                  <span className="text-gold mt-[2px]">ℹ️</span>
                  <span>Please keep this window open until you have completed the payment on your UPI app.</span>
                </p>
                <p className="flex items-start gap-[8px]">
                  <span className="text-gold mt-[2px]">✓</span>
                  <span>Your order will be confirmed by an admin after verifying the payment.</span>
                </p>
              </div>

              <button
                onClick={() => router.push("/my-orders")}
                className="w-full mt-[24px] bg-gold text-[#210B2C] font-[700] py-[14px] rounded-[12px] hover:bg-[#F4C852] transition-colors shadow-[0_8px_20px_rgba(216,154,43,0.3)] hover:shadow-[0_12px_25px_rgba(216,154,43,0.4)]"
              >
                I have done my payment
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
