"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { TicketModal, Booking } from "@/components/bookings/TicketModal";
import Navbar from "@/components/layout/Navbar";
import { Calendar, Clock, MapPin, Users, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/hooks/useSocket";
import { BOOKING_STATUS_UPDATED, BOOKING_CANCELLED } from "@/socket/events";

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await api.get("/bookings/my-bookings");
      
      // Map backend response to Frontend Booking type
      const mappedBookings = response.data.map((b: any) => {
        let durationHrs = 0;
        if (b.startTime && b.endTime) {
          const startHour = parseInt(b.startTime.split(':')[0], 10);
          const startMin = parseInt(b.startTime.split(':')[1] || '0', 10);
          const endHour = parseInt(b.endTime.split(':')[0], 10);
          const endMin = parseInt(b.endTime.split(':')[1] || '0', 10);
          
          let diffHours = endHour - startHour;
          let diffMins = endMin - startMin;
          
          if (diffMins < 0) {
            diffHours -= 1;
            diffMins += 60;
          }
          if (diffHours < 0) {
            diffHours += 24;
          }
          
          durationHrs = diffHours + (diffMins / 60);
        }

        return {
          id: b.id,
          studioName: b.studio.name,
          date: b.bookingDate,
          startTime: b.startTime,
          endTime: b.endTime,
          duration: durationHrs,
          guests: b.guestCount,
          paymentStatus: b.paymentStatus,
          bookingStatus: b.bookingStatus,
            totalAmount: b.totalAmount,
            bookingReference: b.bookingReference,
            userName: user?.fullName || "Guest",
            notes: b.notes,
            orders: b.orders
          };
        });
        setBookings(mappedBookings);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setIsLoading(false);
      }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBookings();
    }
  }, [isLoggedIn, fetchBookings]);

  useSocket(BOOKING_STATUS_UPDATED, ({ bookingId, status }) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: status } : b))
    );
  });

  useSocket(BOOKING_CANCELLED, ({ bookingId }) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: "CANCELLED" } : b))
    );
  });

  const filteredBookings = bookings.filter((b) => {
    const bookingEndDate = new Date(b.date);
    if (b.endTime) {
      const [hours, minutes] = b.endTime.split(':');
      bookingEndDate.setHours(parseInt(hours, 10), parseInt(minutes || '0', 10));
    } else {
      bookingEndDate.setHours(23, 59, 59);
    }
    const isPast = bookingEndDate.getTime() < new Date().getTime();

    if (activeTab === "cancelled") return b.bookingStatus === "CANCELLED";
    if (activeTab === "completed") {
      return b.bookingStatus === "COMPLETED" || 
             (b.bookingStatus === "CONFIRMED" && isPast) ||
             (b.bookingStatus === "PENDING" && isPast);
    }
    
    // For upcoming tab
    return b.bookingStatus !== "CANCELLED" && b.bookingStatus !== "COMPLETED" && !isPast;
  });

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-deep text-text-light font-body pt-[100px] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-200">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-text-white mb-3">Access Restricted</h2>
          <p className="text-text-muted mb-8 max-w-md">
            You need to be logged in to view your bookings. Please sign in to continue or return to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById("sign-in-btn")?.click()}
              className="px-8 py-3 rounded-full bg-gold text-[#12041A] font-bold shadow-[0_8px_24px_rgba(216,154,43,0.25)] transition-all hover:-translate-y-1"
            >
              Sign In
            </button>
            <Link 
              href="/"
              className="px-8 py-3 rounded-full bg-gray-50 text-text-light font-medium border border-gray-200 transition-all hover:bg-gray-100 hover:-translate-y-1"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep text-text-light font-body pt-[100px]">
      <Navbar />
      
      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link href="/" className="inline-flex items-center gap-[8px] text-text-light hover:text-gold transition-colors duration-300 font-[500] mb-[24px]">
            <span>←</span> Back to Home
          </Link>
          <h1 className="font-heading text-4xl font-bold text-text-white mb-2">My Bookings</h1>
          <p className="text-text-muted">Manage your premium karaoke experiences.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8 relative">
          {(["upcoming", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${
                activeTab === tab ? "text-gold" : "text-text-muted hover:text-text-white"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-[24px] border border-gray-200 bg-white transition-all hover:bg-gray-50 hover:border-gold/30 flex flex-col md:flex-row shadow-sm"
              >
                <div className="p-[24px] flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-[8px] uppercase tracking-wider ${
                      booking.bookingStatus === 'CONFIRMED' ? 'bg-[#2F6B52]/10 text-[#2F6B52] border border-[#2F6B52]/20' :
                      booking.bookingStatus === 'PENDING' ? 'bg-gold/10 text-[#C5A030] border border-gold/20' :
                      'bg-purple/10 text-[#8B5CF6] border border-purple/20'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                    <span className="text-[0.75rem] font-mono text-text-muted tracking-wider">ID: {booking.bookingReference}</span>
                  </div>

                  <h3 className="font-heading text-[1.8rem] md:text-2xl font-[800] text-text-white tracking-tight">{booking.studioName}</h3>

                  <div className="grid grid-cols-2 gap-y-[16px] gap-x-[12px] text-[0.85rem] mt-[16px]">
                    <div className="flex items-center gap-[8px] text-text-muted">
                      <Calendar size={16} className="text-gold" />
                      <span className="font-[500] text-text-light">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-[8px] text-text-muted">
                      <Clock size={16} className="text-gold" />
                      <span className="font-[500] text-text-light">{booking.startTime}</span>
                    </div>
                    <div className="flex items-center gap-[8px] text-text-muted">
                      <Users size={16} className="text-gold" />
                      <span className="font-[500] text-text-light">{booking.guests} Guests</span>
                    </div>
                    <div className="flex items-center gap-[8px] text-text-muted">
                      <Info size={16} className="text-gold" />
                      <span className="font-[500] text-text-light capitalize">{booking.paymentStatus.toLowerCase()}</span>
                    </div>
                    {booking.orders && booking.orders.length > 0 && (
                      <div className="flex items-center gap-[8px] text-gold mt-2 col-span-2">
                        <span>☕</span>
                        <span className="font-[500]">Food & Beverages included</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Divider (Dashed with Notches) */}
                <div className="relative w-full md:w-px h-[24px] md:h-auto flex items-center justify-center -my-[12px] md:my-0 md:-mx-[12px] z-10">
                  {/* Mobile Notches */}
                  <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-bg-deep rounded-full md:hidden border-r border-gray-200"></div>
                  <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-bg-deep rounded-full md:hidden border-l border-gray-200"></div>
                  
                  {/* Desktop Notches */}
                  <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-[24px] h-[24px] bg-bg-deep rounded-full hidden md:block border-b border-gray-200"></div>
                  <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-[24px] h-[24px] bg-bg-deep rounded-full hidden md:block border-t border-gray-200"></div>

                  <div className="w-[calc(100%-48px)] md:w-full h-px md:h-[calc(100%-48px)] border-t border-dashed md:border-t-0 md:border-l border-gray-300"></div>
                </div>

                <div className="p-[24px] flex flex-col justify-between items-start md:items-end bg-gray-50 md:bg-transparent min-w-[200px]">
                    <div className="text-left md:text-right w-full mb-4 md:mb-0">
                      <p className="text-sm text-text-muted mb-1 font-medium">Total Amount</p>
                      <p className="font-mono text-2xl font-bold text-text-white">₹{booking.totalAmount}</p>
                    </div>

                    {activeTab === "upcoming" ? (
                      <button
                        onClick={() => handleViewTicket(booking)}
                        className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gold/10 text-gold font-semibold text-sm border border-gold/20 transition-all hover:bg-gold hover:text-black"
                      >
                        View Ticket
                      </button>
                    ) : activeTab === "completed" ? (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleViewTicket(booking)}
                          className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gray-100 text-text-white font-medium text-sm border border-gray-200 transition-all hover:bg-gray-200"
                        >
                          Receipt
                        </button>
                        <Link
                          href="/#studios"
                          className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-gold/10 text-gold font-medium text-sm border border-gold/20 transition-all hover:bg-gold hover:text-black"
                        >
                          Book Again
                        </Link>
                      </div>
                    ) : null}
                  </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-200">
              <Calendar size={40} className="text-gray-300" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-text-white mb-3">
              No {activeTab} bookings found
            </h3>
            <p className="text-text-muted mb-8 max-w-md">
              You haven't booked your next karaoke experience yet. Our premium studios are waiting for your voice.
            </p>
            <Link
              href="/#studios"
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-[#12041A] font-bold shadow-[0_8px_24px_rgba(216,154,43,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(216,154,43,0.35)]"
            >
              Book a Studio
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </main>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
