"use client";

import React, { useEffect, useRef, useState } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import { bookingApi } from "../../lib/api";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BookingModal() {
  const { isBookingModalOpen, selectedStudio, bookingData, closeBookingModal, setBookingData, resetBookingData, openBookingModal, setActiveBookingId, activeBookingId } = useBookingStore();
  const router = useRouter();
  
  const [view, setView] = useState<"select_studio" | "form" | "loading" | "upsell" | "confirmation">("form");
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; status: "available" | "booked" | "past" }[]>([]);
  const [realStudioId, setRealStudioId] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string>("");
  const [agreedToRefunds, setAgreedToRefunds] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isBookingModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      return () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isBookingModalOpen]);

  useEffect(() => {
    if (selectedStudio) {
      const resolveStudioId = async () => {
        try {
          const { api } = await import('@/lib/api');
          const res = await api.get('/studios');
          const found = res.data.find((s: any) => s.name === selectedStudio.name);
          setRealStudioId(found ? found.id : selectedStudio.id);
        } catch (e) {
          setRealStudioId(selectedStudio.id);
        }
      };
      resolveStudioId();
    }
  }, [selectedStudio]);

  // Generate generic slots for the day (12 AM to 11 PM)
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 0;
    while (currentHour < 24) {
      const isAm = currentHour < 12;
      let displayHour = currentHour % 12;
      if (displayHour === 0) displayHour = 12;
      slots.push(`${displayHour}:00 ${isAm ? 'AM' : 'PM'}`);
      currentHour++;
    }
    return slots;
  };

  const formatTo24Hour = (time12: string) => {
    const [hourStr, modifier] = time12.split(' ');
    let hour = parseInt(hourStr);
    if (modifier === 'PM' && hour < 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const parseTime = (timeStr: string) => {
    const [hourStr, minStr] = timeStr.split(':');
    return parseInt(hourStr) * 60 + parseInt(minStr);
  };

  const fetchAvailability = async () => {
    if (!selectedStudio || !bookingData.date) return;
    
    try {
      const allSlots = generateTimeSlots();
      const now = new Date();
      const selectedDate = new Date(bookingData.date);
      const isToday = selectedDate.toDateString() === now.toDateString();
      const currentHour = now.getHours();

      let bookedSlots = [];
      try {
        if (realStudioId) {
          const res = await bookingApi.getBookedSlots(realStudioId, bookingData.date);
          bookedSlots = res.data || [];
        }
      } catch (e) {
        console.error("Failed to fetch booked slots from backend", e);
      }
      
      const slotsWithStatus = allSlots.map(time => {
        const time24 = formatTo24Hour(time);
        const hour = parseInt(time24.split(':')[0]);

        let status: "available" | "booked" | "past" = "available";
        if (isToday && hour <= currentHour) {
          status = "past";
        } else {
          const timeMins = parseTime(time24);
          const isBooked = bookedSlots.some((slot: any) => {
            const startMins = parseTime(slot.startTime);
            const endMins = parseTime(slot.endTime);
            return timeMins >= startMins && timeMins < endMins;
          });
          if (isBooked) {
            status = "booked";
          }
        }

        return { time, status };
      });

      setAvailableSlots(slotsWithStatus);
    } catch (error) {
      console.error("Failed to fetch slots", error);
    }
  };

  useEffect(() => {
    if (isBookingModalOpen) {
      if (selectedStudio && realStudioId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView("form");
        fetchAvailability();
      } else if (!selectedStudio) {
         
        setView("select_studio");
      }
    } else {
      // Only reset form fields — do NOT clear activeBookingId here.
      // The user may be browsing the café as part of the upsell flow.
      setBookingData({ date: new Date().toISOString().split('T')[0], duration: 1, guests: "5 - 10 Guests", name: "", phone: "", slot: null, notes: "" });
      setMobileStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingModalOpen, bookingData.date, selectedStudio, realStudioId]);

  if (!isBookingModalOpen) return null;

  const handleSlotSelect = (time: string, status: string) => {
    if (status !== "available") return;
    setBookingData({ slot: time });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.slot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!selectedStudio) return;

    setView("loading");

    try {
      const startTime24 = formatTo24Hour(bookingData.slot);
      const endHour = parseInt(startTime24.split(':')[0]) + bookingData.duration;
      const endTime24 = `${endHour.toString().padStart(2, '0')}:00`;

      const payload = {
        studioId: realStudioId || selectedStudio.id,
        bookingDate: bookingData.date, // already YYYY-MM-DD
        startTime: startTime24,
        endTime: endTime24,
        guestCount: parseInt(bookingData.guests.split(' ')[0]) || 5, // Extract number from "5 - 10 Guests"
        notes: bookingData.notes,
        paymentMethod: "OFFLINE" // Default to offline for now
      };

      const res = await bookingApi.createBooking(payload);
      
      setActiveBookingId(res.data.id);
      setView("upsell");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to create booking");
      setView("form");
    }
  };

  return (
    <AnimatePresence>
      {isBookingModalOpen && (
        <motion.div 
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="booking-overlay open" 
          role="dialog" 
          aria-modal="true" 
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBookingModal();
          }}
          onWheel={(e) => {
            // Programmatically scroll the overlay when wheel events fire on child elements
            if (overlayRef.current) {
              overlayRef.current.scrollTop += e.deltaY;
            }
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="booking-modal"
          >
            <button className="booking-close" aria-label="Close booking" onClick={closeBookingModal}>✕</button>

        {view === "select_studio" && (
          <div className="booking-form-view" style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ marginBottom: "8px" }}>Select a Studio 🎤</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.9rem" }}>Which studio would you like to book?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "300px", margin: "0 auto" }}>
              <button 
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "16px" }}
                onClick={() => openBookingModal({ id: "NAMAS Studio 1", name: "NAMAS Studio 1", price: 1000 })}
              >
                NAMAS Studio 1
                <span style={{ fontSize: "0.8rem", opacity: 0.8, marginLeft: "8px" }}>(₹1000/hr)</span>
              </button>
              <button 
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "16px" }}
                onClick={() => openBookingModal({ id: "NAMAS Studio 2", name: "NAMAS Studio 2", price: 1400 })}
              >
                NAMAS Studio 2
                <span style={{ fontSize: "0.8rem", opacity: 0.8, marginLeft: "8px" }}>(₹1400/hr)</span>
              </button>
            </div>
          </div>
        )}

        {view === "form" && selectedStudio && (
          <div className="booking-form-view">
            <h2>Reserve Your Studio 🎤</h2>
            <p className="booking-studio-name">{selectedStudio.name}</p>

            {/* Step Indicators for Mobile */}
            <div className="md:hidden flex items-center justify-between gap-[8px] mb-[24px]">
               <div className={`h-[4px] rounded-full flex-1 transition-colors duration-300 ${mobileStep >= 1 ? 'bg-gold' : 'bg-white/10'}`} />
               <div className={`h-[4px] rounded-full flex-1 transition-colors duration-300 ${mobileStep >= 2 ? 'bg-gold' : 'bg-white/10'}`} />
               <div className={`h-[4px] rounded-full flex-1 transition-colors duration-300 ${mobileStep >= 3 ? 'bg-gold' : 'bg-white/10'}`} />
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div className={`booking-grid ${mobileStep !== 1 && mobileStep !== 2 ? 'hidden md:grid' : ''}`}>
                <div className={`form-group ${mobileStep !== 1 ? 'hidden md:block' : ''}`}>
                  <label>Select Date</label>
                  <input 
                    type="date" 
                    id="bk-date" 
                    className="form-select" 
                    style={{ colorScheme: 'dark' }} 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ date: e.target.value, slot: null })}
                  />
                </div>
                <div className={`form-group ${mobileStep !== 1 ? 'hidden md:block' : ''}`}>
                  <label>Duration (hours)</label>
                  <select 
                    id="bk-duration" 
                    className="form-select"
                    style={{ background: 'var(--bg-card)' }}
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({ duration: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(h => (
                      <option key={h} value={h} style={{ background: '#16131D', color: '#fff' }}>{h} Hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className={`form-group ${mobileStep !== 1 ? 'hidden md:block' : ''}`}>
                  <label>Number of Guests</label>
                  <select 
                    id="bk-guests" 
                    className="form-select"
                    style={{ background: 'var(--bg-card)' }}
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({ guests: e.target.value })}
                  >
                    <option style={{ background: '#16131D', color: '#fff' }}>5 - 10 Guests</option>
                    <option style={{ background: '#16131D', color: '#fff' }}>10 - 20 Guests</option>
                    <option style={{ background: '#16131D', color: '#fff' }}>20 - 40 Guests</option>
                    <option style={{ background: '#16131D', color: '#fff' }}>40 - 60 Guests</option>
                    <option style={{ background: '#16131D', color: '#fff' }}>60 - 90 Guests</option>
                  </select>
                </div>
                <div className={`form-group ${mobileStep !== 2 ? 'hidden md:block' : ''}`}>
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    id="bk-name" 
                    placeholder="Full name" 
                    required 
                    className="form-select"
                    style={{ background: 'var(--bg-card)' }}
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ name: e.target.value })}
                  />
                </div>
              </div>

              <div className={`form-group ${mobileStep !== 2 ? 'hidden md:block' : ''}`}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  id="bk-phone" 
                  placeholder="+91 96443 97658" 
                  required 
                  className="form-select"
                  style={{ background: 'var(--bg-card)' }}
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ phone: e.target.value })}
                />
              </div>

              {/* Time slot picker */}
              <div className={`time-slots ${mobileStep !== 1 ? 'hidden md:block' : ''}`}>
                <div className="time-slots-label">Select Time Slot</div>
                <div className="slots-grid">
                  {availableSlots.map(({ time, status }) => (
                    <div 
                      key={time} 
                      className={`slot ${status} ${bookingData.slot === time ? 'selected' : ''}`}
                      data-time={time}
                      onClick={() => handleSlotSelect(time, status)}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                <div className="slot-legend">
                  <span><span className="slot-dot dot-available"></span>Available</span>
                  <span><span className="slot-dot dot-booked"></span>Booked</span>
                  <span><span className="slot-dot dot-past"></span>Past</span>
                </div>
              </div>

              <div className={`form-group ${mobileStep !== 2 ? 'hidden md:block' : ''}`}>
                <label>Special Requests (optional)</label>
                <input 
                  type="text" 
                  id="bk-notes" 
                  placeholder="Birthday decorations, cake, etc." 
                  className="form-select"
                  style={{ background: 'var(--bg-card)' }}
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ notes: e.target.value })}
                />
              </div>

              {/* Booking summary */}
              <div className={`booking-summary ${mobileStep !== 3 ? 'hidden md:flex' : ''} flex-col gap-3 p-4 bg-white/5 rounded-lg border border-white/10 mt-4 w-full`}>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Studio Rate</span>
                  <span>₹{selectedStudio?.price || 0} × {bookingData.duration}hr</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">₹{(selectedStudio?.price ? selectedStudio.price * bookingData.duration : 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className={`mt-4 mb-2 flex items-start gap-2 ${mobileStep !== 3 ? 'hidden md:flex' : ''}`}>
                <input 
                  type="checkbox" 
                  id="refund-consent"
                  className="mt-1 cursor-pointer"
                  checked={agreedToRefunds}
                  onChange={(e) => setAgreedToRefunds(e.target.checked)}
                />
                <label htmlFor="refund-consent" className="text-sm text-white/60 cursor-pointer">
                  I agree to the <a href="/refunds" target="_blank" className="text-gold hover:underline">Cancellation and Refund Policy</a>.
                </label>
              </div>

              {/* Mobile Next/Back Buttons */}
              <div className="md:hidden flex gap-[12px] mt-[24px]">
                {mobileStep > 1 && (
                  <button type="button" className="btn flex-1 bg-white/5 border border-white/10 text-white min-h-[48px]" onClick={() => setMobileStep(mobileStep - 1 as 1 | 2)}>
                    Back
                  </button>
                )}
                {mobileStep < 3 && (
                  <button type="button" className="btn btn-primary flex-1 justify-center min-h-[48px]" onClick={() => {
                    if (mobileStep === 1 && !bookingData.slot) {
                      toast.error("Please select a time slot");
                      return;
                    }
                    setMobileStep(mobileStep + 1 as 2 | 3);
                  }}>
                    Next Step
                  </button>
                )}
                {mobileStep === 3 && (
                  <button type="submit" disabled={!agreedToRefunds} className="btn btn-primary flex-1 justify-center min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed">
                    Proceed to Payment 💳
                  </button>
                )}
              </div>

              {/* Desktop Submit Button */}
              <button type="submit" disabled={!agreedToRefunds} className="hidden md:flex btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Payment 💳
              </button>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '12px'
              }}>
                You will be able to complete payment on the next screen
              </p>
            </form>
          </div>
        )}

        {view === "loading" && (
          <div className="checkout-overlay" style={{ display: "flex" }}>
            <div className="checkout-spinner"></div>
            <h3 style={{ fontFamily: "var(--font-display)", marginTop: "20px" }}>Securing your slot...</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Please do not close this window.</p>
          </div>
        )}

        {view === "confirmation" && (
          <div className="booking-confirmation active">
            <div className="confirm-icon">🎉</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Booking Confirmed!</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Your studio has been reserved. Get ready to sing!</p>
            
            <div className="booking-ticket">
              <div className="ticket-header">
                <span className="ticket-brand">NUKKAD BEATS</span>
                <span className="ticket-id">#NB{ticketId}</span>
              </div>
              <div className="ticket-body">
                <div className="ticket-row">
                  <div className="ticket-col">
                    <span className="ticket-label">Studio</span>
                    <span className="ticket-val">{selectedStudio?.name || "Unknown"}</span>
                  </div>
                  <div className="ticket-col" style={{ textAlign: "right" }}>
                    <span className="ticket-label">Date</span>
                    <span className="ticket-val">{new Date(bookingData.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ticket-row">
                  <div className="ticket-col">
                    <span className="ticket-label">Time</span>
                    <span className="ticket-val">{bookingData.slot}</span>
                  </div>
                  <div className="ticket-col" style={{ textAlign: "right" }}>
                    <span className="ticket-label">Duration</span>
                    <span className="ticket-val">{bookingData.duration} Hour(s)</span>
                  </div>
                </div>
              </div>
              
              <div className="ticket-footer" style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                {/* Embedded QR Code */}
                <QRCodeSVG 
                  value={`nb-booking-${selectedStudio?.id || "unknown"}-${bookingData.date}-${bookingData.slot}`} 
                  size={120} 
                  bgColor={"#ffffff"} 
                  fgColor={"#0D0B12"} 
                  level={"M"}
                  includeMargin={true}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>
            
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "24px" }} onClick={closeBookingModal}>
              Download Ticket & Close ✓
            </button>
          </div>
        )}

        {view === "upsell" && (
          <div className="booking-form-view" style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ marginBottom: "8px", fontSize: "1.8rem" }}>Do you want to add food? 🍔</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "0.95rem" }}>
              Would you like to pre-order food & beverages for your studio session?<br/>
              Your food and drinks will be prepared before your session starts and served directly to your studio.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px", margin: "0 auto" }}>
              <button 
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "16px", fontSize: "1rem" }}
                onClick={() => {
                  closeBookingModal();
                  // Scroll to cafe section if it exists
                  setTimeout(() => {
                    document.getElementById('cafe')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Add Food & Beverages ☕
              </button>
              <button 
                className="btn btn-outline"
                style={{ 
                  justifyContent: "center", 
                  padding: "16px", 
                  fontSize: "1rem", 
                  background: "transparent", 
                  border: "1px solid var(--glass-border)", 
                  color: "var(--text-light)" 
                }}
                onClick={() => {
                  closeBookingModal();
                  if (activeBookingId) {
                    router.push(`/payment/booking/${activeBookingId}`);
                    setActiveBookingId(null);
                  }
                }}
              >
                Skip & Continue to Payment
              </button>
            </div>
          </div>
        )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
