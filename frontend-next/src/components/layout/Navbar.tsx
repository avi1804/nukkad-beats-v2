"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { AuthModal } from "../auth/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "../cart/CartDrawer";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  useEffect(() => {
    if (!mobileUserMenuOpen) return;
    const handleClose = () => setMobileUserMenuOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [mobileUserMenuOpen]);

  const { user, logout, authModalOpen, setAuthModalOpen } = useAuthStore();
  const isLoggedIn = !!user;
  const { openBookingModal } = useBookingStore();
  
  const cartTotal = useCartStore((state) => state.getTotalItems());
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  const toggleMobileUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileUserMenuOpen(!mobileUserMenuOpen);
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gold origin-left z-[1001]"
        style={{ scaleX: scrollYProgress }}
      />
      {/* Mobile Nav is handled by MobileNav.tsx now */}

      {/* Main Navbar */}
      <motion.nav
        initial={{ 
          backgroundColor: "transparent", 
          backdropFilter: "blur(0px)",
          borderBottomColor: "transparent"
        }}
        animate={{ 
          backgroundColor: scrolled ? "rgba(11, 11, 15, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          borderBottomColor: scrolled ? "rgba(255, 255, 255, 0.08)" : "transparent",
          paddingTop: scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
          boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.4)" : "none"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-[1000] border-b"
      >
        <div className="max-w-[1200px] mx-auto px-[24px] flex items-center justify-between">
          <Link
            href="/#home"
            className="flex items-center gap-[12px] font-heading font-[800] text-[1.3rem] group"
          >
            <Image
              src="/images/download.png"
              alt="Nukkad Beats"
              width={200}
              height={60}
              style={{ width: "auto" }}
              className="h-[60px] w-auto max-w-[200px] object-contain transition-transform duration-300 ease-spring drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:scale-105"
            />
          </Link>

          <ul className="hidden md:flex items-center gap-[36px]" role="list">
            <li>
              <Link
                href="#home"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="#studios"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Studios
              </Link>
            </li>
            <li>
              <Link
                href="#cafe"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Café
              </Link>
            </li>
            <li>
              <Link
                href="#gallery"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="#testimonials"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="text-[0.88rem] font-[500] text-text-light transition-colors duration-250 relative hover:text-text-white after:content-[''] after:absolute after:-bottom-[3px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Right Side Actions */}
          <div className="flex items-center gap-[12px] md:gap-[16px]">
            {/* Desktop Auth and Book Now */}
            <div className="hidden md:flex items-center gap-[12px]">
              {isLoggedIn ? (
                <div className="relative group">
                  <button className="flex items-center gap-[8px] pl-[8px] pr-[20px] py-[9px] rounded-[14px] text-[0.85rem] font-[600] border border-[rgba(188,150,230,0.20)] bg-[rgba(188,150,230,0.08)] text-[#BC96E6] backdrop-blur-[12px] transition-all hover:bg-[rgba(188,150,230,0.14)] hover:border-[rgba(188,150,230,0.35)] hover:-translate-y-[2px]">
                    <div className="w-[28px] h-[28px] rounded-full bg-gold flex items-center justify-center font-[700] text-[0.9rem] text-[#0D0B12] shadow-[0_0_10px_rgba(216,154,43,0.4)]">
                      {user?.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{user?.fullName?.split(" ")[0] || "User"}</span>
                    <span className="text-[0.6rem] opacity-70">▼</span>
                  </button>
                  <div className="absolute top-[calc(100%+10px)] right-0 bg-glass-bg backdrop-blur-[20px] border border-glass-border rounded-[12px] p-[8px] min-w-[160px] flex flex-col gap-[4px] opacity-0 invisible -translate-y-[10px] transition-all duration-300 ease-out-custom shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[1000] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                    <Link
                      href="/my-orders"
                      className="px-[16px] py-[10px] text-text-light text-[0.85rem] rounded-[8px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/my-bookings"
                      className="px-[16px] py-[10px] text-text-light text-[0.85rem] rounded-[8px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/settings"
                      className="px-[16px] py-[10px] text-text-light text-[0.85rem] rounded-[8px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                    >
                      Settings
                    </Link>
                    <hr className="border-glass-border my-[4px]" />
                    <button onClick={logout} className="text-left px-[16px] py-[10px] text-[#ff4d4f] text-[0.85rem] rounded-[8px] transition-colors duration-200 hover:bg-[#ff4d4f]/10">
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
              {!isLoggedIn && (
                <button
                  className="flex items-center justify-center gap-[8px] px-[20px] py-[9px] rounded-[14px] font-body text-[0.85rem] font-[600] transition-all duration-300 text-text-light hover:text-white hover:-translate-y-[2px]"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In
                </button>
              )}
              <button
                className="flex items-center justify-center gap-[8px] px-[20px] py-[9px] rounded-[14px] font-body text-[0.85rem] font-[600] transition-all duration-300 border border-[rgba(255,209,102,0.15)] bg-[#FFD166] text-[#210B2C] shadow-[0_8px_24px_rgba(255,209,102,0.18)] hover:bg-[#F4C852] hover:-translate-y-[2px] hover:shadow-[0_12px_30px_rgba(255,209,102,0.25)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(255,209,102,0.15)]"
                onClick={() => {
                  if (!isLoggedIn) {
                    setAuthModalOpen(true);
                  } else {
                    openBookingModal();
                  }
                }}
              >
                Book Now ✦
              </button>
            </div>

            {/* WhatsApp Button */}
              <a
                href="https://wa.me/919644397658"
                target="_blank"
                rel="noopener noreferrer"
                className="flex md:hidden items-center justify-center w-[32px] h-[32px] rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors shadow-lg"
                aria-label="Chat on WhatsApp"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="w-[18px] h-[18px]"
                />
              </a>

              {/* Mobile Auth Button (Sign In / User Profile) */}
              {!isLoggedIn && (
                <button
                  className="flex md:hidden items-center justify-center px-[12px] py-[6px] rounded-[10px] font-body text-[0.78rem] font-[600] border border-white/10 bg-white/5 text-text-light active:bg-white/10 transition-all duration-200"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Sign In
                </button>
              )}
              {isLoggedIn && (
                <div className="relative md:hidden">
                  <button
                    onClick={toggleMobileUserMenu}
                    className="flex items-center gap-[4px] pl-[6px] pr-[10px] py-[5px] rounded-[10px] text-[0.78rem] font-[600] border border-[rgba(188,150,230,0.20)] bg-[rgba(188,150,230,0.08)] text-[#BC96E6] backdrop-blur-[12px]"
                  >
                    <div className="w-[20px] h-[20px] rounded-full bg-gold flex items-center justify-center font-[700] text-[0.75rem] text-[#0D0B12] shadow-[0_0_6px_rgba(216,154,43,0.3)]">
                      {user?.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>{user?.fullName?.split(" ")[0] || "User"}</span>
                    <span className="text-[0.5rem] opacity-70">▼</span>
                  </button>
                  {mobileUserMenuOpen && (
                    <div 
                      className="absolute top-[calc(100%+6px)] right-0 bg-[#0B0B0F]/97 backdrop-blur-[20px] border border-glass-border rounded-[10px] p-[6px] min-w-[130px] flex flex-col gap-[2px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[1001]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href="/my-orders"
                        onClick={() => setMobileUserMenuOpen(false)}
                        className="px-[12px] py-[8px] text-text-light text-[0.78rem] rounded-[6px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/my-bookings"
                        onClick={() => setMobileUserMenuOpen(false)}
                        className="px-[12px] py-[8px] text-text-light text-[0.78rem] rounded-[6px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileUserMenuOpen(false)}
                        className="px-[12px] py-[8px] text-text-light text-[0.78rem] rounded-[6px] transition-colors duration-200 hover:bg-white/5 hover:text-text-white"
                      >
                        Settings
                      </Link>
                      <hr className="border-glass-border my-[2px]" />
                      <button
                        onClick={() => {
                          setMobileUserMenuOpen(false);
                          logout();
                        }}
                        className="text-left px-[12px] py-[8px] text-[#ff4d4f] text-[0.78rem] rounded-[6px] transition-colors duration-200 hover:bg-[#ff4d4f]/10"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="bg-transparent border-none text-[1.4rem] text-text-white cursor-pointer relative flex items-center p-[4px] transition-transform duration-250 hover:scale-110"
                aria-label="Open cart"
              >
                🛒
                <span
                  className="absolute -top-[2px] -right-[6px] bg-burgundy text-white text-[0.65rem] font-[700] w-[18px] h-[18px] rounded-full flex items-center justify-center"
                  style={{ display: !isMounted || cartTotal === 0 ? "none" : "flex" }}
                >
                  {isMounted ? cartTotal : 0}
                </span>
              </button>

            </div>
        </div>
      </motion.nav>
      <CartDrawer />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
