"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const { scrollY } = useScroll();
  const yContent = useTransform(scrollY, [0, 1000], [0, 250]);
  const yOrb1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const yOrb2 = useTransform(scrollY, [0, 1000], [0, 150]);
  const yOrb3 = useTransform(scrollY, [0, 1000], [0, 200]);

  // Framer motion equivalents for Intersection Observer counting
  const [hasRevealed, setHasRevealed] = useState(false);

  return (
    <section
      className="min-h-screen flex items-center relative overflow-hidden pt-[80px]"
      id="home"
    >
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-bg-music.png)' }}
        />
        {/* Premium gradient overlay: solid white on the left for text readability, fading to transparent on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/20 backdrop-blur-[2px] z-[1]" />
        
        {/* Subtle, glowing ambient orbs */}
        <motion.div
          style={{ y: yOrb1 }}
          className="absolute rounded-full pointer-events-none blur-[120px] w-[600px] h-[600px] bg-gold/10 -top-[100px] -left-[100px] animate-orb-float z-[2]"
        />
        <motion.div
          style={{ y: yOrb2, animationDirection: "alternate-reverse", animationDuration: "14s" }}
          className="absolute rounded-full pointer-events-none blur-[120px] w-[500px] h-[500px] bg-purple/5 -bottom-[50px] -right-[50px] animate-orb-float z-[2]"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-[24px] relative z-[2] grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center w-full">
        <motion.div
          style={{ y: yContent }}
          className="max-w-[580px]"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onViewportEnter={() => setHasRevealed(true)}
        >
          <div className="inline-flex items-center gap-[10px] text-[0.8rem] font-[600] tracking-[0.15em] uppercase text-text-muted mb-[24px]">
            <span className="w-[6px] h-[6px] rounded-full bg-gold animate-pulse-glow" />
            Now Open in Your City
          </div>

          <h1 className="font-heading text-[clamp(2.4rem,10vw,3.5rem)] md:text-[clamp(3rem,6vw,5.5rem)] font-[800] leading-[1.05] tracking-[-0.02em] mb-[24px] text-text-white">
            Nukkad
            <br />
            <span className="gradient-text">Beats</span>
          </h1>

          <p className="text-[1.15rem] text-text-light font-medium mb-[40px] leading-[1.7] max-w-[460px] drop-shadow-sm">
            Experience premium karaoke studios and café vibes like never before.
            Private rooms, craft beverages, and unforgettable moments — all
            under one roof.
          </p>

          <div className="flex flex-col md:flex-row gap-[16px] mb-[32px] md:mb-[56px]">
            <button
              className="btn btn-primary px-[24px] py-[14px] md:py-[12px] text-[0.95rem] md:text-[0.9rem]"
              onClick={() => {
                document.getElementById("studios")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Book a Studio
            </button>
            <button
              className="btn btn-outline px-[24px] py-[14px] md:py-[12px] text-[0.95rem] md:text-[0.9rem]"
              onClick={() => {
                document.getElementById("cafe")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Café
            </button>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-[24px] md:gap-[40px] mb-[24px] md:mb-0">
            <div>
              <div className="font-heading text-[1.8rem] md:text-[2rem] font-[800] text-gold">2+</div>
              <div className="text-[0.75rem] md:text-[0.8rem] text-text-muted mt-[2px]">Private Studios</div>
            </div>
            <div>
              <div className="font-heading text-[1.8rem] md:text-[2rem] font-[800] text-gold">500+</div>
              <div className="text-[0.75rem] md:text-[0.8rem] text-text-muted mt-[2px]">Happy Guests</div>
            </div>
            <div>
              <div className="font-heading text-[1.8rem] md:text-[2rem] font-[800] text-gold">5.0★</div>
              <div className="text-[0.75rem] md:text-[0.8rem] text-text-muted mt-[2px]">Avg Rating</div>
            </div>
          </div>

        </motion.div>

        {/* Animated features visual */}
        <motion.div 
          className="hidden md:block" aria-hidden="true"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="flex gap-[14px] flex-col items-end text-text-white">
            <motion.div 
              whileHover={{ scale: 1.05, x: -10 }}
              className="glass-card px-[20px] py-[14px] flex items-center gap-[10px] text-[0.82rem] cursor-default"
            >
              <span className="text-[1.2rem]">🎙️</span>
              <div>
                <div className="font-[600]">Professional Mics</div>
                <div className="text-text-muted text-[0.75rem]">Crystal clear sound</div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, x: -10 }}
              className="glass-card px-[20px] py-[14px] flex items-center gap-[10px] text-[0.82rem] cursor-default mr-[40px]"
            >
              <span className="text-[1.2rem]">🍵</span>
              <div>
                <div className="font-[600]">Free Tea Included</div>
                <div className="text-text-muted text-[0.75rem]">With every booking</div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, x: -10 }}
              className="glass-card px-[20px] py-[14px] flex items-center gap-[10px] text-[0.82rem] cursor-default"
            >
              <span className="text-[1.2rem]">🎂</span>
              <div>
                <div className="font-[600]">Birthday Packages</div>
                <div className="text-text-muted text-[0.75rem]">Make it special</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="hidden md:flex absolute bottom-[32px] left-1/2 -translate-x-1/2 flex-col items-center gap-[8px] z-[2] text-text-white font-semibold text-[0.75rem] tracking-[0.1em] drop-shadow-md bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
        <div className="w-[22px] h-[36px] border-[2px] border-text-white rounded-[12px] flex justify-center pt-[6px]">
          <span className="w-[3px] h-[8px] bg-purple rounded-[2px] animate-scroll-dot" />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
