"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { toast } from "react-hot-toast";
import { User, Phone, Mail, Calendar, ShieldBan, ShieldCheck } from "lucide-react";

export default function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id: string, isBlocked: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isBlocked: !isBlocked });
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  if (isLoading) {
    return <div className="checkout-spinner" style={{ margin: "100px auto" }}></div>;
  }

  return (
    <div className="admin-customers">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem" }}>Customer Management</h2>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>CUSTOMER</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>CONTACT</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>JOINED</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>ACTIVITY</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem" }}>STATUS</th>
                <th style={{ padding: "16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s", opacity: u.isBlocked ? 0.6 : 1 }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                        width: "36px", height: "36px", 
                        borderRadius: "50%", 
                        background: "var(--gold)", 
                        color: "var(--bg-main)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "bold"
                      }}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-light)" }}>
                          {u.fullName} {u.role === 'ADMIN' && <span style={{ fontSize: '0.7rem', background: 'var(--gold)', color: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>ADMIN</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Mail size={14} /> {u.email}
                    </div>
                    {u.phone && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={14} /> {u.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={14} />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{u._count.bookings}</span> Bookings
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <span style={{ color: "var(--gold)", fontWeight: "bold" }}>{u._count.orders}</span> Orders
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    {u.isBlocked ? (
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "100px", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545" }}>
                        Blocked
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "100px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    {u.role !== 'ADMIN' && (
                      <button 
                        className="btn" 
                        style={{ 
                          padding: "6px 12px", 
                          background: u.isBlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 53, 69, 0.1)", 
                          color: u.isBlocked ? "#10b981" : "#dc3545", 
                          border: "none",
                          fontSize: "0.85rem"
                        }}
                        onClick={() => toggleUserStatus(u.id, u.isBlocked)}
                      >
                        {u.isBlocked ? (
                          <><ShieldCheck size={16} style={{ marginRight: '6px' }} /> Unblock</>
                        ) : (
                          <><ShieldBan size={16} style={{ marginRight: '6px' }} /> Block</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col gap-4 p-4">
          {users.map((u) => (
            <div key={u.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 flex flex-col gap-3" style={{ opacity: u.isBlocked ? 0.6 : 1 }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-[36px] h-[36px] rounded-full bg-gold text-[#0B0B0F] flex items-center justify-center font-bold">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-text-light flex items-center gap-2">
                      {u.fullName} {u.role === 'ADMIN' && <span className="text-[0.6rem] bg-gold text-[#0B0B0F] px-1.5 py-0.5 rounded">ADMIN</span>}
                    </div>
                    <div className="text-[0.75rem] text-text-muted mt-0.5 flex items-center gap-1">
                      <Calendar size={10} /> Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {u.isBlocked ? (
                  <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[rgba(220,53,69,0.1)] text-[#dc3545]">Blocked</span>
                ) : (
                  <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10b981]">Active</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1 text-sm mt-1">
                <div className="text-[0.8rem] text-text-muted flex items-center gap-1.5">
                  <Mail size={12} /> {u.email}
                </div>
                {u.phone && (
                  <div className="text-[0.8rem] text-text-muted flex items-center gap-1.5">
                    <Phone size={12} /> {u.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.05)] pt-3 mt-1">
                <div className="flex gap-4">
                  <div className="text-[0.8rem] text-text-muted">
                    <span className="text-gold font-bold">{u._count?.bookings || 0}</span> Bookings
                  </div>
                  <div className="text-[0.8rem] text-text-muted">
                    <span className="text-gold font-bold">{u._count?.orders || 0}</span> Orders
                  </div>
                </div>
                <div>
                  {u.role !== 'ADMIN' && (
                    <button 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-[0.75rem] transition-colors"
                      style={{ 
                        background: u.isBlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 53, 69, 0.1)", 
                        color: u.isBlocked ? "#10b981" : "#dc3545"
                      }}
                      onClick={() => toggleUserStatus(u.id, u.isBlocked)}
                    >
                      {u.isBlocked ? (
                        <><ShieldCheck size={14} /> Unblock</>
                      ) : (
                        <><ShieldBan size={14} /> Block</>
                      )}
                    </button>
                  )}
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
