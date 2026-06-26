"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { CreditCard, CheckCircle, Clock, XCircle, Search, Filter } from "lucide-react";
import PaymentDrawer from "../../../components/admin/PaymentDrawer";
import { useSocket } from "../../../hooks/useSocket";
import { PAYMENT_STATUS_UPDATED, PAYMENT_VERIFIED } from "../../../socket/events";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const [bookingsRes, ordersRes] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/orders")
      ]);
      
      const bookingPayments = bookingsRes.data.map((b: any) => ({
        id: `BKG-${b.id}`,
        originalId: b.id,
        type: "Studio Booking",
        amount: b.totalAmount,
        status: b.paymentStatus,
        method: b.paymentMethod,
        date: b.createdAt,
        customerName: b.user.fullName,
        customerEmail: b.user.email,
        customerPhone: b.user.phone,
        reference: b.bookingReference,
        studioDetails: {
          name: b.studio.name,
          date: b.bookingDate,
          time: `${b.startTime} - ${b.endTime}`
        }
      }));

      const orderPayments = ordersRes.data.map((o: any) => ({
        id: `ORD-${o.id}`,
        originalId: o.id,
        type: "Cafe Order",
        amount: o.totalAmount,
        status: o.paymentStatus,
        method: o.paymentMethod || "ONLINE",
        date: o.createdAt,
        customerName: o.user.fullName,
        customerEmail: o.user.email,
        customerPhone: o.user.phone,
        reference: `ORD-${o.id.substring(o.id.length - 6).toUpperCase()}`,
        items: o.items
      }));

      const allPayments = [...bookingPayments, ...orderPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPayments(allPayments);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useSocket(PAYMENT_STATUS_UPDATED, () => {
    fetchPayments();
  });

  useSocket(PAYMENT_VERIFIED, () => {
    fetchPayments();
  });

  // Compute Stats
  const stats = useMemo(() => {
    let total = payments.length;
    let pending = 0;
    let verified = 0;
    let rejected = 0;
    let todayRevenue = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    payments.forEach(p => {
      const isVerified = p.status === "PAID" || p.status === "VERIFIED";
      const isRejected = p.status === "FAILED" || p.status === "REJECTED";
      
      if (isVerified) verified++;
      else if (isRejected) rejected++;
      else pending++;

      if (isVerified && new Date(p.date) >= todayStart) {
        todayRevenue += p.amount;
      }
    });

    return { total, pending, verified, rejected, todayRevenue };
  }, [payments]);

  // Compute Filtered
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      // Status Filter
      const isVerified = p.status === "PAID" || p.status === "VERIFIED";
      const isRejected = p.status === "FAILED" || p.status === "REJECTED";
      const isPending = !isVerified && !isRejected;

      if (statusFilter === "PENDING" && !isPending) return false;
      if (statusFilter === "VERIFIED" && !isVerified) return false;
      if (statusFilter === "REJECTED" && !isRejected) return false;

      // Type Filter
      if (typeFilter === "STUDIO" && p.type !== "Studio Booking") return false;
      if (typeFilter === "CAFE" && p.type !== "Cafe Order") return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const ref = p.reference.toLowerCase();
        const name = p.customerName.toLowerCase();
        if (!ref.includes(query) && !name.includes(query)) return false;
      }

      return true;
    });
  }, [payments, statusFilter, typeFilter, searchQuery]);

  const handleRowClick = (payment: any) => {
    setSelectedPayment(payment);
    setIsDrawerOpen(true);
  };

  return (
    <div className="admin-payments">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>Payments Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">Total Payments</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-500 text-xs uppercase tracking-wider font-semibold mb-1">Pending</p>
          <h3 className="text-2xl font-bold text-amber-400">{stats.pending}</h3>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-500 text-xs uppercase tracking-wider font-semibold mb-1">Verified</p>
          <h3 className="text-2xl font-bold text-emerald-400">{stats.verified}</h3>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500 text-xs uppercase tracking-wider font-semibold mb-1">Rejected</p>
          <h3 className="text-2xl font-bold text-red-400">{stats.rejected}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gold text-xs uppercase tracking-wider font-semibold mb-1">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-gold">₹{stats.todayRevenue.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by Ref or Customer Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-gold/50 transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-gold/50 transition-colors"
          >
            <option value="ALL">All Types</option>
            <option value="STUDIO">Studio Booking</option>
            <option value="CAFE">Cafe Order</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="checkout-spinner" style={{ margin: "100px auto" }}></div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>TRANSACTION REF</th>
                  <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>CUSTOMER</th>
                  <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>TYPE / DATE</th>
                  <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>AMOUNT</th>
                  <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                      No transactions found.
                    </td>
                  </tr>
                ) : filteredPayments.map((p) => {
                  const isVerified = p.status === "PAID" || p.status === "VERIFIED";
                  const isRejected = p.status === "FAILED" || p.status === "REJECTED";
                  
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => handleRowClick(p)}
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s", cursor: "pointer" }}
                      className="hover:bg-white/5"
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-light)" }}>{p.reference}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          {p.method}
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 500 }}>{p.customerName}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 500, color: p.type === 'Studio Booking' ? '#8b5cf6' : '#f59e0b' }}>{p.type}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                          <Clock size={12} />
                          {new Date(p.date).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>₹{p.amount.toLocaleString("en-IN")}</div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ 
                          display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "6px 12px", borderRadius: "100px", fontWeight: 600,
                          background: isVerified ? 'rgba(16, 185, 129, 0.1)' : isRejected ? 'rgba(220, 53, 69, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: isVerified ? '#10b981' : isRejected ? '#dc3545' : '#f59e0b'
                        }}>
                          {isVerified ? <CheckCircle size={14} /> : isRejected ? <XCircle size={14} /> : <Clock size={14} />}
                          {isVerified ? "VERIFIED" : isRejected ? "REJECTED" : "PENDING"}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col gap-4 p-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center text-text-muted py-8">No transactions found.</div>
            ) : filteredPayments.map((p) => {
              const isVerified = p.status === "PAID" || p.status === "VERIFIED";
              const isRejected = p.status === "FAILED" || p.status === "REJECTED";

              return (
                <div 
                  key={p.id} 
                  onClick={() => handleRowClick(p)}
                  className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.05)] pb-3">
                    <div>
                      <div className="font-semibold text-text-light text-sm">{p.reference}</div>
                      <div className="text-[0.7rem] text-text-muted mt-0.5 uppercase tracking-wide">{p.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gold leading-tight">₹{p.amount.toLocaleString("en-IN")}</div>
                      <div className="mt-1" style={{ 
                        display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 600,
                        background: isVerified ? 'rgba(16, 185, 129, 0.1)' : isRejected ? 'rgba(220, 53, 69, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: isVerified ? '#10b981' : isRejected ? '#dc3545' : '#f59e0b'
                      }}>
                        {isVerified ? <CheckCircle size={10} /> : isRejected ? <XCircle size={10} /> : <Clock size={10} />}
                        {isVerified ? "VERIFIED" : isRejected ? "REJECTED" : "PENDING"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                    <div>
                      <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Customer</div>
                      <div className="font-medium truncate">{p.customerName}</div>
                    </div>
                    <div>
                      <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Type & Date</div>
                      <div className="font-medium truncate" style={{ color: p.type === 'Studio Booking' ? '#8b5cf6' : '#f59e0b' }}>{p.type}</div>
                      <div className="text-[0.75rem] text-text-muted flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {new Date(p.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment Side Drawer */}
      <PaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        payment={selectedPayment}
        onPaymentUpdated={() => fetchPayments()} 
      />
    </div>
  );
}
