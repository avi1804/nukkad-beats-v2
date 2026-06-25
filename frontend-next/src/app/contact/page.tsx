"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-[140px] pb-[80px]">
        <div className="max-w-[800px] mx-auto px-[24px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-[800] mb-[24px]">
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-text-muted mb-[40px]">We're here to help! Reach out to us for any queries.</p>

            <div className="grid md:grid-cols-2 gap-[32px] mt-[40px]">
              <div className="bg-glass-bg border border-glass-border rounded-[20px] p-[32px]">
                <h3 className="text-[1.2rem] font-[700] text-gold mb-[16px]">Get in Touch</h3>
                <div className="space-y-[16px] text-text-light">
                  <p>
                    <strong className="block text-white mb-[4px]">Email:</strong>
                    <a href="mailto:support@nukkadbeats.com" className="hover:text-gold transition-colors">support@nukkadbeats.com</a>
                  </p>
                  <p>
                    <strong className="block text-white mb-[4px]">Phone & WhatsApp:</strong>
                    <a href="tel:+919644397658" className="hover:text-gold transition-colors">+91 96443 97658</a>
                  </p>
                </div>
              </div>

              <div className="bg-glass-bg border border-glass-border rounded-[20px] p-[32px]">
                <h3 className="text-[1.2rem] font-[700] text-gold mb-[16px]">Visit Us</h3>
                <div className="space-y-[16px] text-text-light">
                  <p>
                    <strong className="block text-white mb-[4px]">Location:</strong>
                    Nukkad Beats Premium Studio<br />
                    [Your Street Address]<br />
                    [Your City, State, PIN]
                  </p>
                  <p>
                    <strong className="block text-white mb-[4px]">Operating Hours:</strong>
                    Open 24/7 for pre-booked sessions<br />
                    Café: 10:00 AM - 11:00 PM
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
