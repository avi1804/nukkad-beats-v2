"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { Download, X } from "lucide-react";

export interface Booking {
  id: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  guests: number;
  paymentStatus: string;
  bookingStatus: string;
  totalAmount: number;
  bookingReference: string;
  userName: string;
  notes?: string;
  orders?: any[];
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function TicketModal({ isOpen, onClose, booking }: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        backgroundColor: "#0B0B0F",
        pixelRatio: 2,
      });
      
      const link = document.createElement("a");
      link.download = `NukkadBeats_Ticket_${booking.bookingReference}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0B0F]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="relative w-full max-w-[450px] overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#0B0B0F]/90 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[24px]"
          >
            {/* Action Buttons */}
            <div className="absolute right-[20px] top-[20px] z-50 flex gap-2">
              <button
                onClick={handleDownload}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-gold hover:text-black"
                title="Download Ticket"
              >
                <Download size={18} />
              </button>
              <button
                onClick={onClose}
                className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-red-500/80"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ticket Content */}
            <div ref={ticketRef} className="p-[32px] pt-[48px]">
              <div className="text-center mb-6 border-b border-white/10 pb-6">
                <h2 className="font-heading text-2xl font-bold text-gold">Nukkad Beats</h2>
                <p className="text-text-muted text-sm mt-1">Premium Karaoke & Café</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Booking ID</span>
                  <span className="font-mono text-white font-semibold">{booking.bookingReference}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Guest Name</span>
                  <span className="text-white font-medium">{booking.userName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Studio</span>
                  <span className="text-gold font-medium">{booking.studioName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Date & Time</span>
                  <span className="text-white font-medium">
                    {new Date(booking.date).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Duration</span>
                  <span className="text-white font-medium">{booking.duration} hrs</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Guests</span>
                  <span className="text-white font-medium">{booking.guests} People</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Amount Paid</span>
                  <span className="text-white font-medium font-mono">₹{booking.totalAmount}</span>
                </div>

                {booking.orders && booking.orders.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-text-muted text-sm flex items-center gap-1 mb-2">
                      <span>☕</span> Included Food & Beverages
                    </span>
                    <div className="space-y-1">
                      {booking.orders.map((order: any) => (
                        <React.Fragment key={order.id}>
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className="text-white/80">{item.quantity}x {item.product?.name}</span>
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-text-muted text-sm">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.bookingStatus === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                    booking.bookingStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                <QRCodeSVG value={booking.bookingReference} size={150} level="H" />
                <p className="text-black/60 text-xs mt-3 font-medium">Show this at reception</p>
              </div>

              <div className="mt-6 text-center text-xs text-text-muted">
                <p>Present this ticket at the venue at least 10 minutes before your slot.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
