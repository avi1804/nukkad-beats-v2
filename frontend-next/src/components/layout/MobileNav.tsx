"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Home, Mic2, Coffee, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { AuthModal } from "../auth/AuthModal";

export default function MobileNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");
  const { user, setAuthModalOpen } = useAuthStore();
  const isLoggedIn = !!user;
  const cartTotal = useCartStore((state) => state.getTotalItems());
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Rough heuristic for active tab based on hash for home page, or pathname
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (pathname !== "/") {
        setActiveTab("profile");
        return;
      }
      if (hash.includes("studios")) setActiveTab("studios");
      else if (hash.includes("cafe")) setActiveTab("cafe");
      else setActiveTab("home");
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", () => {
      if (pathname !== "/") return;
      const scrollY = window.scrollY;
      if (scrollY < 500) setActiveTab("home");
      else if (scrollY > 500 && scrollY < 1500) setActiveTab("studios");
      else if (scrollY > 1500 && scrollY < 3000) setActiveTab("cafe");
    }, { passive: true });

    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  if (!isMounted) return null;
  if (pathname.startsWith('/nukkadkaadmin')) return null;
  const handleProfileClick = () => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
    } else {
      window.location.href = "/my-bookings";
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className="fixed bottom-[20px] left-[50%] -translate-x-[50%] z-[1000] w-[90%] max-w-[400px] h-[68px] md:hidden bg-[rgba(18,16,25,0.75)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.08)] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] px-[8px] flex items-center justify-between overflow-hidden"
      >
        {/* Animated Background Indicator */}
        <div className="absolute inset-0 flex items-center px-[8px] pointer-events-none">
          <motion.div
            className="h-[52px] w-[calc((100%-16px)/5)] bg-[rgba(255,255,255,0.08)] rounded-[18px] border border-[rgba(255,255,255,0.04)]"
            animate={{
              x:
                activeTab === "home" ? "0%" :
                activeTab === "studios" ? "100%" :
                activeTab === "cafe" ? "200%" :
                activeTab === "cart" ? "300%" :
                "400%"
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        </div>

        <Link
          href="/#home"
          onClick={() => setActiveTab("home")}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-[4px] cursor-pointer"
        >
          <Home size={22} className={cn("transition-colors duration-300", activeTab === "home" ? "text-gold" : "text-text-muted")} />
          <span className={cn("text-[0.65rem] font-[600] transition-colors duration-300", activeTab === "home" ? "text-gold" : "text-text-muted")}>Home</span>
        </Link>

        <Link
          href="/#studios"
          onClick={() => setActiveTab("studios")}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-[4px] cursor-pointer"
        >
          <Mic2 size={22} className={cn("transition-colors duration-300", activeTab === "studios" ? "text-gold" : "text-text-muted")} />
          <span className={cn("text-[0.65rem] font-[600] transition-colors duration-300", activeTab === "studios" ? "text-gold" : "text-text-muted")}>Studios</span>
        </Link>

        <Link
          href="/#cafe"
          onClick={() => setActiveTab("cafe")}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-[4px] cursor-pointer"
        >
          <Coffee size={22} className={cn("transition-colors duration-300", activeTab === "cafe" ? "text-gold" : "text-text-muted")} />
          <span className={cn("text-[0.65rem] font-[600] transition-colors duration-300", activeTab === "cafe" ? "text-gold" : "text-text-muted")}>Café</span>
        </Link>

        <button
          onClick={() => {
            setActiveTab("cart");
            setCartOpen(true);
          }}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-[4px] cursor-pointer bg-transparent border-none"
        >
          <div className="relative">
            <ShoppingBag size={22} className={cn("transition-colors duration-300", activeTab === "cart" ? "text-gold" : "text-text-muted")} />
            {cartTotal > 0 && (
              <div className="absolute -top-[4px] -right-[6px] w-[16px] h-[16px] bg-gold text-[#0B0B0F] rounded-full flex items-center justify-center text-[0.6rem] font-[800]">
                {cartTotal}
              </div>
            )}
          </div>
          <span className={cn("text-[0.65rem] font-[600] transition-colors duration-300", activeTab === "cart" ? "text-gold" : "text-text-muted")}>Cart</span>
        </button>

        <button
          onClick={handleProfileClick}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-[4px] cursor-pointer bg-transparent border-none"
        >
          {isLoggedIn ? (
            <div className="w-[22px] h-[22px] rounded-full bg-gold flex items-center justify-center font-[800] text-[0.7rem] text-[#0D0B12]">
              {user?.fullName?.[0]?.toUpperCase() || "U"}
            </div>
          ) : (
            <User size={22} className={cn("transition-colors duration-300", activeTab === "profile" ? "text-gold" : "text-text-muted")} />
          )}
          <span className={cn("text-[0.65rem] font-[600] transition-colors duration-300", activeTab === "profile" ? "text-gold" : "text-text-muted")}>Profile</span>
        </button>
      </motion.div>
    </>
  );
}
