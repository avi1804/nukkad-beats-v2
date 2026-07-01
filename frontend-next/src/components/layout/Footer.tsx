"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="pt-[80px] pb-[40px] border-t border-glass-border bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-[24px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[40px] lg:gap-[60px] mb-[60px]">
            <div className="flex flex-col gap-[20px]">
              <Link href="#home" className="inline-block">
                <Image
                  src="/images/download.png"
                  alt="Nukkad Beats"
                  width={200}
                  height={60}
                  style={{ width: "auto" }}
                  className="h-[60px] w-auto max-w-[200px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-spring hover:scale-105"
                />
              </Link>
              <p className="text-text-muted text-[0.9rem] leading-[1.6]">
                Where every voice finds its stage. Premium private karaoke studios
                and café — crafted for unforgettable moments.
              </p>
              <div className="flex gap-[12px]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  className="w-[40px] h-[40px] rounded-[12px] bg-white border border-glass-border flex items-center justify-center text-text-light transition-all duration-300 hover:-translate-y-[2px] hover:bg-gold hover:text-white hover:border-gold shadow-sm"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  className="w-[40px] h-[40px] rounded-[12px] bg-white border border-glass-border flex items-center justify-center text-text-light transition-all duration-300 hover:-translate-y-[2px] hover:bg-gold hover:text-white hover:border-gold shadow-sm"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.81l.39-4h-4.2V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  className="w-[40px] h-[40px] rounded-[12px] bg-white border border-glass-border flex items-center justify-center text-text-light transition-all duration-300 hover:-translate-y-[2px] hover:bg-gold hover:text-white hover:border-gold shadow-sm"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  className="w-[40px] h-[40px] rounded-[12px] bg-white border border-glass-border flex items-center justify-center text-text-light transition-all duration-300 hover:-translate-y-[2px] hover:bg-gold hover:text-white hover:border-gold shadow-sm"
                  aria-label="WhatsApp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="font-heading text-[1.1rem] font-[700] mb-[20px] text-text-white">
                Quick Links
              </h4>
              <div className="flex flex-col gap-[12px]">
                <Link href="#home" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Home</Link>
                <Link href="#studios" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Book a Studio</Link>
                <Link href="#cafe" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Café Menu</Link>
                <Link href="#gallery" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Gallery</Link>
                <Link href="#testimonials" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Reviews</Link>
                <Link href="/about" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">About Us</Link>
                <Link href="/contact" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Contact</Link>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="font-heading text-[1.1rem] font-[700] mb-[20px] text-text-white">
                Studios
              </h4>
              <div className="flex flex-col gap-[12px]">
                <Link href="#studios" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">NAMAS Studio 1</Link>
                <Link href="#studios" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">NAMAS Studio 2</Link>
                <Link href="#" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Birthday Packages</Link>
                <Link href="#" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Corporate Events</Link>
                <Link href="#" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">Group Bookings</Link>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="font-heading text-[1.1rem] font-[700] mb-[20px] text-text-white">
                Contact Info
              </h4>
              <div className="flex flex-col gap-[12px]">
                <a href="tel:+919644397658" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">📞 +91 96443 97658</a>
                <a href="mailto:nukkadbeatsofficial@gmail.com" className="text-text-muted text-[0.85rem] transition-colors hover:text-text-white">✉️ nukkadbeatsofficial@gmail.com</a>
                <span className="text-text-muted text-[0.85rem]">📍 102, Sigma Legacy, Ambawadi, Ahmedabad 380015</span>
                <span className="text-text-muted text-[0.85rem]">🕐 Open Daily 11AM–11PM</span>
              </div>
            </div>
          </div>

          <div className="pt-[30px] border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-[20px] text-text-muted text-[0.85rem]">
            <p>© 2024 Nukkad Beats. All rights reserved. Made with 🎵</p>
            <div className="flex gap-[20px]">
              <Link href="/privacy" className="transition-colors hover:text-gold">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-gold">Terms & Conditions</Link>
              <Link href="/refunds" className="transition-colors hover:text-gold">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
