"use client";

import React, { useEffect, useState, useRef } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, Search, XCircle, Clock, CalendarDays, Users, Check } from "lucide-react";

export default function ScanTicketPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [scannedBooking, setScannedBooking] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const onScanSuccess = (decodedText: string) => {
    // stop scanning once a code is successfully found
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setBookingRef(decodedText);
    fetchBooking(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Optional: handle scan failures (usually just continuous reading fails)
    // console.warn(`Code scan error = ${error}`);
  };

  const fetchBooking = async (ref: string) => {
    if (!ref) {
      toast.error("Please enter a booking reference");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/bookings/reference/${ref}`);
      setScannedBooking(response.data);
      toast.success("Booking found!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Booking not found");
      setScannedBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
    fetchBooking(bookingRef);
  };

  const handleCheckIn = async () => {
    if (!scannedBooking) return;
    setIsLoading(true);
    try {
      await api.put(`/admin/bookings/${scannedBooking.id}`, {
        bookingStatus: "COMPLETED" // Marking as completed for check-in
      });
      setScannedBooking({ ...scannedBooking, bookingStatus: "COMPLETED" });
      toast.success("Guest checked in successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to check in");
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScannedBooking(null);
    setBookingRef("");
    setIsScanning(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: 0 }}>Scan Ticket</h1>
        {!isScanning && (
          <button 
            onClick={resetScanner}
            className="btn btn-secondary"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            Scan Another Code
          </button>
        )}
      </div>

      <div style={{ display: isScanning ? "block" : "none", marginBottom: "24px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Position the QR code inside the frame to scan</p>
          <div id="reader" style={{ width: "100%", maxWidth: "500px", margin: "0 auto", overflow: "hidden", borderRadius: "8px", background: "black" }}></div>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
        <h3 style={{ marginBottom: "16px", fontFamily: "var(--font-display)" }}>Manual Entry</h3>
        <form onSubmit={handleManualSearch} style={{ display: "flex", gap: "12px" }}>
          <input 
            type="text" 
            className="form-select"
            style={{ flex: 1, padding: "12px" }}
            placeholder="e.g. BKG-E6AA16F1"
            value={bookingRef}
            onChange={(e) => setBookingRef(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ display: "flex", gap: "8px", alignItems: "center" }} disabled={isLoading}>
            <Search size={18} /> Search
          </button>
        </form>
      </div>

      {scannedBooking && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--gold)", borderRadius: "12px", padding: "24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--gold)" }}></div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--gold)", margin: 0, marginBottom: "4px" }}>
                {scannedBooking.studio.name}
              </h2>
              <p style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: "1.1rem" }}>{scannedBooking.bookingReference}</p>
            </div>
            
            <div style={{ 
              background: scannedBooking.bookingStatus === 'COMPLETED' ? "rgba(16, 185, 129, 0.2)" : 
                         scannedBooking.bookingStatus === 'CONFIRMED' ? "rgba(59, 130, 246, 0.2)" : 
                         scannedBooking.bookingStatus === 'PENDING' ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
              color: scannedBooking.bookingStatus === 'COMPLETED' ? "#10b981" : 
                    scannedBooking.bookingStatus === 'CONFIRMED' ? "#3b82f6" : 
                    scannedBooking.bookingStatus === 'PENDING' ? "#f59e0b" : "#ef4444",
              padding: "6px 12px", 
              borderRadius: "20px", 
              fontWeight: "bold",
              fontSize: "0.85rem"
            }}>
              {scannedBooking.bookingStatus}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Guest Name</p>
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{scannedBooking.user?.fullName}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{scannedBooking.user?.phone}</p>
            </div>
            
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>Total Paid</p>
              <p style={{ fontWeight: "bold", fontSize: "1.2rem", fontFamily: "monospace" }}>₹{scannedBooking.totalAmount}</p>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <CalendarDays size={18} color="var(--gold)" />
              <span>{new Date(scannedBooking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Clock size={18} color="var(--gold)" />
              <span>{scannedBooking.startTime} - {scannedBooking.endTime}</span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Users size={18} color="var(--gold)" />
              <span>{scannedBooking.guestCount} Guests</span>
            </div>
          </div>

          {scannedBooking.bookingStatus === "CONFIRMED" || scannedBooking.bookingStatus === "PENDING" ? (
            <button 
              onClick={handleCheckIn}
              className="btn btn-primary"
              style={{ width: "100%", padding: "16px", fontSize: "1.1rem", display: "flex", justifyContent: "center", gap: "8px", alignItems: "center" }}
              disabled={isLoading}
            >
              <CheckCircle size={20} />
              {isLoading ? "Processing..." : "Approve & Check-in Guest"}
            </button>
          ) : scannedBooking.bookingStatus === "COMPLETED" ? (
            <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <Check size={20} />
              <span style={{ fontWeight: "bold" }}>Guest is already checked in</span>
            </div>
          ) : (
            <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
              <XCircle size={20} />
              <span style={{ fontWeight: "bold" }}>This booking is cancelled</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
