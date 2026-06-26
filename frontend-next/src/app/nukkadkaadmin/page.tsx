"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { DollarSign, Music, ShoppingCart, Users, CalendarDays, Clock } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { DASHBOARD_STATS_UPDATED } from "../../socket/events";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/dashboard/charts")
      ]);
      setStats(statsRes.data.data);
      setChartData(chartsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useSocket(DASHBOARD_STATS_UPDATED, () => {
    fetchDashboardData();
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div className="checkout-spinner"></div>
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "var(--gold)" },
    { title: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString("en-IN")}`, icon: Clock, color: "#10b981" },
    { title: "Studio Revenue", value: `₹${(stats?.studioRevenue || 0).toLocaleString("en-IN")}`, icon: Music, color: "#8b5cf6" },
    { title: "Cafe Revenue", value: `₹${(stats?.cafeRevenue || 0).toLocaleString("en-IN")}`, icon: ShoppingCart, color: "#f59e0b" },
    { title: "Total Bookings", value: stats?.totalBookings || 0, icon: CalendarDays, color: "#3b82f6" },
    { title: "Registered Users", value: stats?.registeredUsers || 0, icon: Users, color: "#ec4899" },
  ];

  return (
    <div className="dashboard-overview" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} style={{ 
              background: "rgba(255, 255, 255, 0.06)", 
              border: "1px solid var(--glass-border)", 
              borderRadius: "12px", 
              padding: "24px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "8px", fontWeight: 600 }}>{card.title}</p>
                <h3 style={{ fontSize: "1.8rem", margin: 0, fontFamily: "var(--font-display)" }}>{card.value}</h3>
              </div>
              <div style={{ 
                background: `${card.color}20`, 
                color: card.color, 
                padding: "12px", 
                borderRadius: "12px" 
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="admin-charts-grid">
        
        {/* Revenue Trend Line Chart */}
        <div style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "24px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <h3 style={{ marginBottom: "24px", fontFamily: "var(--font-display)" }}>Revenue Trend (Last 7 Days)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D283E" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ background: "rgba(22, 19, 29, 0.85)", border: "1px solid var(--glass-border)", borderRadius: "8px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                  formatter={(value: any, name: any) => [`₹${value}`, name]}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="var(--gold)" strokeWidth={3} activeDot={{ r: 8 }} name="Total Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Split Bar Chart */}
        <div style={{ background: "rgba(255, 255, 255, 0.06)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "24px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          <h3 style={{ marginBottom: "24px", fontFamily: "var(--font-display)" }}>Studio vs Cafe Revenue</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D283E" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ background: "rgba(22, 19, 29, 0.85)", border: "1px solid var(--glass-border)", borderRadius: "8px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                  formatter={(value: any, name: any) => [`₹${value}`, name]}
                />
                <Legend />
                <Bar dataKey="studio" stackId="a" fill="#8b5cf6" name="Studio Revenue" maxBarSize={40} />
                <Bar dataKey="cafe" stackId="a" fill="#f59e0b" name="Cafe Revenue" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
