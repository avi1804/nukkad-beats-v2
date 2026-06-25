"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Music, 
  Coffee, 
  ShoppingCart, 
  Users, 
  CreditCard,
  LogOut,
  Settings,
  Menu,
  X,
  ScanLine
} from "lucide-react";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && pathname !== "/nukkadkaadmin/login") {
      if (!user) {
        router.replace("/nukkadkaadmin/login");
      }
    }
  }, [isMounted, user, pathname, router]);

  if (!isMounted) return null;

  // Allow unauthenticated access ONLY to the admin login page
  if (pathname === "/nukkadkaadmin/login") {
    return <>{children}</>;
  }

  // Protect admin routes
  if (!user) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="admin-access-denied">
        <div className="denied-box">
          <span className="denied-icon">⚠️</span>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this area.</p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/nukkadkaadmin/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/nukkadkaadmin" },
    { name: "Scan Ticket", icon: ScanLine, path: "/nukkadkaadmin/scan" },
    { name: "Bookings", icon: CalendarDays, path: "/nukkadkaadmin/bookings" },
    { name: "Studios", icon: Music, path: "/nukkadkaadmin/studios" },
    { name: "Cafe Orders", icon: ShoppingCart, path: "/nukkadkaadmin/orders" },
    { name: "Cafe Products", icon: Coffee, path: "/nukkadkaadmin/products" },
    { name: "Customers", icon: Users, path: "/nukkadkaadmin/customers" },
    { name: "Payments", icon: CreditCard, path: "/nukkadkaadmin/payments" },
  ];

  return (
    <div className="admin-layout">
      {/* Overlay for mobile sidebar */}
      <div 
        className={`admin-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="admin-brand" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>NUKKAD <span>ADMIN</span></h1>
          <button 
            className="admin-hamburger md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
            style={{ margin: 0 }}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/nukkadkaadmin' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left" style={{ display: "flex", alignItems: "center" }}>
            <button className="admin-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
            <h2>{menuItems.find(i => pathname === i.path || (i.path !== '/nukkadkaadmin' && pathname.startsWith(i.path)))?.name || "Admin Panel"}</h2>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-user-profile">
              <div className="admin-avatar">{user.fullName.charAt(0)}</div>
              <div className="admin-user-info">
                <span className="admin-name">{user.fullName}</span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}
