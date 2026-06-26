"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { ShoppingCart, Clock, Search, Trash2 } from "lucide-react";
import { useSocket } from "../../../hooks/useSocket";
import { ORDER_NEW, ORDER_STATUS_UPDATED } from "../../../socket/events";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useSocket(ORDER_NEW, (newOrder) => {
    setOrders((prev) => {
      // Avoid duplicates
      if (prev.find((o) => o.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });
    toast.success(`New order received: ${newOrder.orderReference}`);
  });

  useSocket(ORDER_STATUS_UPDATED, ({ orderId, status }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  });

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  if (isLoading) {
    return <div className="checkout-spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="admin-orders">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>Cafe Orders Management</h2>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>ORDER / DATE</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>CUSTOMER</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>ITEMS</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>TOTAL / PAYMENT</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    No orders found.
                  </td>
                </tr>
              ) : orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600, color: "var(--gold)" }}>{o.orderReference}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                      <Clock size={12} />
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500 }}>{o.user.fullName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{o.user.phone || o.user.email}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem" }}>
                      {o.items.map((item: any) => (
                        <div key={item.id} style={{ marginBottom: "2px" }}>
                          <span style={{ color: "var(--gold)" }}>{item.quantity}x</span> {item.product?.name || 'Unknown Product'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "100px", display: "inline-block", marginTop: "4px", 
                      background: o.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: o.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'
                    }}>
                      {o.paymentStatus}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <select 
                      value={o.orderStatus} 
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
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
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {orders.length === 0 ? (
            <div className="text-center text-text-muted py-8">No orders found.</div>
          ) : orders.map((o) => (
            <div key={o.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.05)] pb-3">
                <div>
                  <div className="font-semibold text-gold text-sm">{o.orderReference}</div>
                  <div className="text-[0.7rem] text-text-muted mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {new Date(o.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-text-light leading-tight">₹{o.totalAmount.toLocaleString("en-IN")}</div>
                  <div className="mt-1" style={{ 
                    display: "inline-block", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", fontWeight: 600,
                    background: o.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: o.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'
                  }}>
                    {o.paymentStatus}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                <div>
                  <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Customer</div>
                  <div className="font-medium truncate">{o.user.fullName}</div>
                  <div className="text-[0.7rem] text-text-muted truncate">{o.user.phone || o.user.email}</div>
                </div>
                <div>
                  <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-1">Status</div>
                  <select 
                    value={o.orderStatus} 
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    className="bg-transparent text-text-light border border-[rgba(255,255,255,0.1)] px-2 py-1.5 rounded-[6px] text-[0.75rem] outline-none focus:border-gold transition-colors w-full mt-1"
                  >
                    <option value="PENDING" className="bg-[#0B0B0F]">Pending</option>
                    <option value="PREPARING" className="bg-[#0B0B0F]">Preparing</option>
                    <option value="READY" className="bg-[#0B0B0F]">Ready</option>
                    <option value="DELIVERED" className="bg-[#0B0B0F]">Delivered</option>
                    <option value="CANCELLED" className="bg-[#0B0B0F]">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.05)] pt-2 mt-1">
                <div className="text-[0.7rem] text-text-muted uppercase tracking-wider mb-2">Items</div>
                <div className="text-[0.8rem] space-y-1">
                  {o.items.map((item: any) => (
                    <div key={item.id} className="flex gap-2">
                      <span className="text-gold min-w-[20px]">{item.quantity}x</span> 
                      <span className="truncate">{item.product?.name || 'Unknown Product'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      </div>
    </div>
  );
}
