"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { Calendar, Clock, User, Trash2, Edit, CheckCircle, Search } from "lucide-react";
import ManualBookingForm from "../../../components/admin/ManualBookingForm";
import BookingCalendar from "../../../components/admin/BookingCalendar";
import { useSocket } from "../../../hooks/useSocket";
import { BOOKING_NEW, BOOKING_STATUS_UPDATED, BOOKING_CANCELLED } from "../../../socket/events";

export default function AdminBookings() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "manual">("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]); // Refetch when tab changes

  useSocket(BOOKING_NEW, (newBooking) => {
    setBookings((prev) => {
      if (prev.find((b) => b.id === newBooking.id)) return prev;
      return [newBooking, ...prev];
    });
    toast.success(`New booking received: ${newBooking.bookingReference}`);
  });

  useSocket(BOOKING_STATUS_UPDATED, ({ bookingId, status }) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: status } : b))
    );
  });

  useSocket(BOOKING_CANCELLED, ({ bookingId, status }) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: status } : b))
    );
  });

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/bookings/${id}`, { bookingStatus: status });
      toast.success("Booking status updated");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel and delete this booking? This action will free up the slot.")) return;
    
    try {
      await api.delete(`/admin/bookings/${id}`);
      toast.success("Booking deleted successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to delete booking");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.user.fullName?.toLowerCase().includes(q) ||
      b.user.phone?.toLowerCase().includes(q) ||
      b.studio.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-bookings">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", margin: 0 }}>Studio Bookings</h2>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border)" }}>
        <button 
          onClick={() => setActiveTab("upcoming")}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "upcoming" ? "var(--gold)" : "var(--text-muted)", 
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: activeTab === "upcoming" ? "bold" : "normal",
            borderBottom: activeTab === "upcoming" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Upcoming Bookings
        </button>
        <button 
          onClick={() => setActiveTab("manual")}
          style={{ 
            background: "transparent", 
            border: "none", 
            color: activeTab === "manual" ? "var(--gold)" : "var(--text-muted)", 
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: activeTab === "manual" ? "bold" : "normal",
            borderBottom: activeTab === "manual" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Manual Booking
        </button>
      </div>

      {activeTab === "upcoming" && (
        <>
          <div style={{ marginBottom: "24px", position: "relative" }}>
            <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by customer, phone, reference, or studio..." 
              style={{ paddingLeft: "48px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            {isLoading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>REF / DATE</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>CUSTOMER</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>STUDIO / TIME</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>SOURCE</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>PAYMENT</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>STATUS</th>
                      <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                          No bookings found.
                        </td>
                      </tr>
                    ) : filteredBookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: 600, color: "var(--gold)" }}>{b.bookingReference}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                            <Calendar size={12} />
                            {new Date(b.bookingDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: 500 }}>{b.user.fullName}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{b.user.phone || b.user.email}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: 500 }}>{b.studio.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                            <Clock size={12} />
                            {b.startTime} - {b.endTime} ({b.guestCount} guests)
                          </div>
                          {b.orders && b.orders.length > 0 && (
                            <div style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span>☕</span> + Food Order
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ 
                            fontSize: "0.75rem", padding: "2px 8px", borderRadius: "100px",
                            background: b.bookingSource === 'ADMIN_MANUAL' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: b.bookingSource === 'ADMIN_MANUAL' ? '#3b82f6' : '#10b981'
                          }}>
                            {b.bookingSource === 'ADMIN_MANUAL' ? 'Walk-in / Phone' : 'Online'}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: 600 }}>₹{b.totalAmount.toLocaleString("en-IN")}</div>
                          <div style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "100px", display: "inline-block", marginTop: "4px", 
                            background: b.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: b.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'
                          }}>
                            {b.paymentStatus} ({b.paymentMethod})
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <select 
                            value={b.bookingStatus} 
                            onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                            style={{ 
                              background: "var(--bg-main)", 
                              color: "var(--text-light)", 
                              border: "1px solid var(--border)", 
                              padding: "6px 12px", 
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              cursor: "pointer"
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button 
                              className="btn" 
                              style={{ padding: "6px", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", border: "none" }} 
                              title="Delete"
                              onClick={() => deleteBooking(b.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center text-text-muted py-8">No bookings found.</div>
                  ) : filteredBookings.map((b) => (
                    <div key={b.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gold">{b.bookingReference}</div>
                          <div className="text-[0.75rem] text-text-muted flex items-center gap-1 mt-1">
                            <Calendar size={12} /> {new Date(b.bookingDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{ 
                          fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px",
                          background: b.bookingSource === 'ADMIN_MANUAL' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: b.bookingSource === 'ADMIN_MANUAL' ? '#3b82f6' : '#10b981'
                        }}>
                          {b.bookingSource === 'ADMIN_MANUAL' ? 'Walk-in' : 'Online'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                        <div>
                          <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Customer</div>
                          <div className="font-medium truncate">{b.user.fullName}</div>
                          <div className="text-[0.75rem] text-text-muted truncate">{b.user.phone || b.user.email}</div>
                        </div>
                        <div>
                          <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Studio</div>
                          <div className="font-medium truncate">{b.studio.name}</div>
                          <div className="text-[0.75rem] text-text-muted flex items-center gap-1"><Clock size={12}/>{b.startTime}-{b.endTime}</div>
                          {b.orders && b.orders.length > 0 && (
                            <div className="text-[0.75rem] text-gold flex items-center gap-1 mt-1">
                              <span>☕</span> + Food
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.05)] pt-3 mt-1">
                        <div>
                          <div className="font-semibold">₹{b.totalAmount.toLocaleString("en-IN")}</div>
                          <div className="text-[0.7rem] mt-1" style={{
                            color: b.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'
                          }}>
                            {b.paymentStatus} ({b.paymentMethod})
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <select 
                            value={b.bookingStatus} 
                            onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                            className="bg-transparent text-text-light border border-[rgba(255,255,255,0.1)] px-2 py-1.5 rounded-[6px] text-[0.75rem] outline-none focus:border-gold transition-colors"
                          >
                            <option value="PENDING" className="bg-[#0B0B0F]">Pending</option>
                            <option value="CONFIRMED" className="bg-[#0B0B0F]">Confirmed</option>
                            <option value="COMPLETED" className="bg-[#0B0B0F]">Completed</option>
                            <option value="CANCELLED" className="bg-[#0B0B0F]">Cancelled</option>
                          </select>
                          <button 
                            onClick={() => deleteBooking(b.id)} 
                            className="p-1.5 bg-[rgba(220,53,69,0.1)] text-[#dc3545] rounded-[6px]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeTab === "manual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <BookingCalendar />
          <ManualBookingForm onSuccess={() => setActiveTab("upcoming")} />
        </div>
      )}
    </div>
  );
}
