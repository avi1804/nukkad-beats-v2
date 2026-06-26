"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Navbar from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import Link from "next/link";

export default function BookingQRPaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        toast.error("Failed to load booking details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold mb-4">Booking not found</h2>
        <button onClick={() => router.push("/")} className="text-gold underline">Return Home</button>
      </div>
    );
  }

  // Use a fixed UPI ID for demonstration
  const upiId = "manika.saini2020-2@okhdfcbank";

  const studioAmount = booking.totalAmount || 0;
  const foodAmount = booking.orders && booking.orders.length > 0
    ? booking.orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
    : 0;
  const totalAmount = studioAmount + foodAmount;
  const amount = totalAmount.toFixed(2);

  const upiLink = `upi://pay?pa=${upiId}&pn=Nukkad%20Beats&am=${amount}&cu=INR&tn=Booking%20${booking.bookingReference}`;

  const formattedDate = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A";

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      <Navbar />
      <div className="flex-1 pt-[120px] pb-[80px] max-w-[800px] mx-auto px-[24px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-[32px]"
        >
          <button onClick={() => router.back()} className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back
          </button>
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

            {/* Right: Booking Summary */}
            <div className="flex-1 w-full flex flex-col">
              <div className="bg-white/5 border border-white/10 rounded-[16px] p-[24px] flex-1">
                <h3 className="text-white font-[700] text-[1.1rem] mb-[20px] border-b border-white/10 pb-[12px]">Booking Summary</h3>

                <div className="flex flex-col gap-[12px] mb-[24px]">
                  <div className="flex justify-between">
                    <span className="text-text-light">Booking ID</span>
                    <span className="font-[600] text-white">{booking.bookingReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Customer</span>
                    <span className="font-[600] text-white">{user?.fullName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Studio</span>
                    <span className="font-[600] text-white">{booking.studio?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Date</span>
                    <span className="font-[600] text-white">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Time</span>
                    <span className="font-[600] text-white">{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-[12px]">
                  <span className="text-text-light font-[600]">Studio Subtotal</span>
                  <span className="text-white">₹{studioAmount.toFixed(2)}</span>
                </div>

                {/* Food Summary */}
                {booking.orders && booking.orders.length > 0 && (
                  <div className="mt-[20px] border-t border-white/10 pt-[20px]">
                    <h3 className="text-white font-[700] text-[1.1rem] mb-[16px] border-b border-white/10 pb-[12px] flex items-center gap-[8px]">
                      <span>☕</span> Food & Beverages
                    </h3>
                    <div className="flex flex-col gap-[12px] mb-[12px]">
                      {booking.orders.map((order: any) => (
                        <React.Fragment key={order.id}>
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-text-light">{item.quantity}x {item.product?.name}</span>
                              <span className="text-white text-[0.95rem]">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex justify-between mt-[12px]">
                      <span className="text-text-light font-[600]">Food Subtotal</span>
                      <span className="text-white">₹{foodAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-[20px] border-t border-white/10 flex justify-between items-center">
                  <span className="text-white font-[600] text-[1.1rem]">Grand Total</span>
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
                  <span>Your booking will be confirmed automatically once payment is received.</span>
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
