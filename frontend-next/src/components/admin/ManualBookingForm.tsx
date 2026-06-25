"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { toast } from "react-hot-toast";

export default function ManualBookingForm({ onSuccess }: { onSuccess: () => void }) {
  const [studios, setStudios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    guestCount: 1,
    notes: "",
    studioId: "",
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    duration: 1, // hours
    paymentStatus: "PENDING",
    paymentMethod: "OFFLINE",
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const res = await api.get("/studios");
        setStudios(res.data.data || res.data);
      } catch (err) {
        console.error("Failed to fetch studios", err);
      }
    };
    fetchStudios();
  }, []);

  // Auto-calculate end time and total amount
  useEffect(() => {
    if (formData.studioId && formData.duration && formData.startTime) {
      const studio = studios.find(s => s.id === formData.studioId);
      if (studio) {
        setFormData(prev => ({
          ...prev,
          totalAmount: studio.pricePerHour * prev.duration
        }));
      }
    }
  }, [formData.studioId, formData.duration, formData.startTime, studios]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate endTime from startTime and duration
      const [startHour, startMin] = formData.startTime.split(":").map(Number);
      const endHour = startHour + Number(formData.duration);
      const endTime = `${endHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;

      const payload = {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        guestCount: Number(formData.guestCount),
        notes: formData.notes,
        studioId: formData.studioId,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: endTime,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        totalAmount: formData.totalAmount,
      };

      await api.post("/admin/bookings/manual", payload);
      toast.success("Manual booking created successfully!");
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        customerName: "",
        phone: "",
        email: "",
        notes: "",
      }));
      
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create manual booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", marginBottom: "24px" }}>Create Manual Booking</h3>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Customer Information */}
        <div>
          <h4 style={{ color: "var(--gold)", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Customer Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Customer Name *</label>
              <input type="text" name="customerName" className="form-input" required value={formData.customerName} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Mobile Number *</label>
              <input type="tel" name="phone" className="form-input" required value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Email Address (Optional)</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Number of Guests *</label>
              <input type="number" name="guestCount" className="form-input" min="1" required value={formData.guestCount} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Studio & Time */}
        <div>
          <h4 style={{ color: "var(--gold)", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Studio & Time</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Select Studio *</label>
              <select name="studioId" className="form-select" required value={formData.studioId} onChange={handleChange}>
                <option value="">-- Choose Studio --</option>
                {studios.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.pricePerHour}/hr)</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Booking Date *</label>
              <input type="date" name="bookingDate" className="form-input" required value={formData.bookingDate} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Start Time *</label>
              <select name="startTime" className="form-select" required value={formData.startTime} onChange={handleChange}>
                {Array.from({ length: 15 }).map((_, i) => {
                  const hour = i + 9; // 9 AM to 11 PM
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                })}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Duration (Hours) *</label>
              <select name="duration" className="form-select" required value={formData.duration} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
               <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Notes / Instructions</label>
               <input type="text" name="notes" className="form-input" value={formData.notes} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Pricing & Payment */}
        <div>
          <h4 style={{ color: "var(--gold)", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>Pricing & Payment</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Payment Status</label>
              <select name="paymentStatus" className="form-select" required value={formData.paymentStatus} onChange={handleChange}>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending (Pay at Reception)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Payment Method</label>
              <select name="paymentMethod" className="form-select" required value={formData.paymentMethod} onChange={handleChange}>
                <option value="OFFLINE">Cash / Offline</option>
                <option value="ONLINE">UPI / Card</option>
              </select>
            </div>
            <div style={{ background: "rgba(216, 154, 43, 0.1)", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(216, 154, 43, 0.3)" }}>
              <span style={{ display: "block", fontSize: "0.85rem", color: "var(--gold)" }}>Total Amount</span>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold", fontFamily: "monospace" }}>₹{formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }} disabled={isLoading || !formData.studioId}>
            {isLoading ? "Creating..." : "Confirm & Block Slot"}
          </button>
        </div>

      </form>
    </div>
  );
}
