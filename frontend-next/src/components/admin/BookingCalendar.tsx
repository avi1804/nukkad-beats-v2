"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [studios, setStudios] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time slots from 09:00 to 23:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 9);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studiosRes, bookingsRes] = await Promise.all([
          api.get("/studios"),
          api.get("/admin/bookings") // Ideally, a backend filter by date, but we can filter client-side for now
        ]);
        setStudios(studiosRes.data.data || studiosRes.data);
        
        // Filter bookings for the selected date
        const filteredBookings = bookingsRes.data.filter((b: any) => 
          new Date(b.bookingDate).toISOString().split("T")[0] === selectedDate &&
          b.bookingStatus !== "CANCELLED"
        );
        setBookings(filteredBookings);
      } catch (err) {
        console.error("Failed to fetch calendar data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const getBookingForSlot = (studioId: string, hour: number) => {
    return bookings.find(b => {
      if (b.studioId !== studioId) return false;
      const startHour = parseInt(b.startTime.split(":")[0]);
      const endHour = parseInt(b.endTime.split(":")[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: 0 }}>Daily Schedule</h3>
        <input 
          type="date" 
          className="form-input" 
          style={{ width: "auto" }}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading schedule...</div>
      ) : (
        <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "80px", padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>Time</th>
                {studios.map(studio => (
                  <th key={studio.id} style={{ padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "center", color: "var(--gold)" }}>
                    {studio.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => {
                const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                return (
                  <tr key={hour} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "16px 12px", textAlign: "center", borderRight: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {timeStr}
                    </td>
                    {studios.map(studio => {
                      const booking = getBookingForSlot(studio.id, hour);
                      
                      let bg = "rgba(16, 185, 129, 0.05)";
                      let borderColor = "rgba(16, 185, 129, 0.2)";
                      let text = "Available";
                      let textColor = "#10b981";

                      if (booking) {
                        if (booking.paymentStatus === 'PENDING') {
                          bg = "rgba(245, 158, 11, 0.1)";
                          borderColor = "rgba(245, 158, 11, 0.3)";
                          text = `${booking.user.fullName} (Pending)`;
                          textColor = "#f59e0b";
                        } else {
                          bg = "rgba(239, 68, 68, 0.1)";
                          borderColor = "rgba(239, 68, 68, 0.3)";
                          text = `${booking.user.fullName} (${booking.bookingSource === 'ADMIN_MANUAL' ? 'Walk-in' : 'Online'})`;
                          textColor = "#ef4444";
                        }
                      }

                      return (
                        <td key={`${studio.id}-${hour}`} style={{ padding: "8px", borderRight: "1px solid var(--border)" }}>
                          <div style={{ 
                            background: bg, 
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            padding: "12px 8px",
                            textAlign: "center",
                            fontSize: "0.85rem",
                            color: textColor,
                            fontWeight: booking ? "bold" : "normal",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {text}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, "0")}:00`;
            return (
              <div key={hour} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4">
                <h4 className="text-gold font-bold mb-3 border-b border-[rgba(255,255,255,0.05)] pb-2">{timeStr}</h4>
                <div className="flex flex-col gap-2">
                  {studios.map(studio => {
                    const booking = getBookingForSlot(studio.id, hour);
                    
                    let bg = "rgba(16, 185, 129, 0.05)";
                    let borderColor = "rgba(16, 185, 129, 0.2)";
                    let text = "Available";
                    let textColor = "#10b981";

                    if (booking) {
                      if (booking.paymentStatus === 'PENDING') {
                        bg = "rgba(245, 158, 11, 0.1)";
                        borderColor = "rgba(245, 158, 11, 0.3)";
                        text = `${booking.user.fullName} (Pending)`;
                        textColor = "#f59e0b";
                      } else {
                        bg = "rgba(239, 68, 68, 0.1)";
                        borderColor = "rgba(239, 68, 68, 0.3)";
                        text = `${booking.user.fullName} (${booking.bookingSource === 'ADMIN_MANUAL' ? 'Walk-in' : 'Online'})`;
                        textColor = "#ef4444";
                      }
                    }

                    return (
                      <div key={`${studio.id}-${hour}`} className="flex justify-between items-center p-2 rounded-lg" style={{ background: bg, border: `1px solid ${borderColor}` }}>
                        <span className="text-[0.8rem] text-text-light font-medium">{studio.name}</span>
                        <span className="text-[0.75rem] font-bold" style={{ color: textColor }}>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
