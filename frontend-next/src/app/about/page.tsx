"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
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
              About <span className="gradient-text">Nukkad Beats</span>
            </h1>

            <div className="prose prose-invert prose-gold max-w-none space-y-[32px]">
              <p className="text-[1.1rem] text-text-light leading-[1.8]">
                Nukkad Beats is a premium studio and café experience designed for creators, artists, and music enthusiasts. We provide state-of-the-art facilities paired with exceptional hospitality.
              </p>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">Our Mission</h2>
                <p className="text-text-light leading-[1.8]">
                  Our mission is to create a vibrant, inspiring space where creativity flows naturally. We believe that a great environment, combined with premium food and beverages, is the key to unlocking your best performance.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">The Experience</h2>
                <p className="text-text-light leading-[1.8]">
                  At Nukkad Beats, you don't just book a studio; you book an experience. From our seamless online booking system to our in-studio food service, every detail is crafted to ensure you can focus entirely on your art while we take care of the rest.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
