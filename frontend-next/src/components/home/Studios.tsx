"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "../auth/AuthModal";

export default function Studios() {
  const { openBookingModal } = useBookingStore();
  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dbStudios, setDbStudios] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchStudios = async () => {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.get('/studios');
        setDbStudios(res.data);
      } catch (e) {
        console.error("Failed to fetch studios", e);
      }
    };
    fetchStudios();
  }, []);
  const studios = [
    {
      id: "NAMAS Studio 1",
      name: "NAMAS Studio 1",
      tagline: "Intimate vibes for close-knit celebrations",
      maxGuests: 50,
      price: 1000,
      access: "Full",
      features: ["LED Screen", "Tea Included", "Pro Mic Setup", "AC", "Photo Ready"],
      icon: "🎤",
      image: "/images/studio1.png",
      badge: "Popular",
      badgeGradient: "bg-burgundy",
      bgGradient: "bg-[rgba(0,0,0,0.2)]",
      glowGradient: "radial-gradient(ellipse at center, rgba(122, 30, 37, 0.4), transparent 70%)",
      delay: 0.1,
    },
    {
      id: "NAMAS Studio 2",
      name: "NAMAS Studio 2",
      tagline: "Go big — perfect for large groups and events",
      maxGuests: 90,
      price: 1400,
      access: "Full",
      features: ["LED Screen", "Tea Included", "Pro Mic Setup", "AC", "Party Setup"],
      icon: "🎶",
      image: "/images/studio2.png",
      badge: "XL Space",
      badgeGradient: "bg-[linear-gradient(135deg,#00b4d8,#f72585)]",
      bgGradient: "bg-[linear-gradient(135deg,#0d1a2e,#1a0d2e)]",
      glowGradient: "radial-gradient(ellipse at center, rgba(122, 30, 37, 0.4), transparent 70%)",
      delay: 0.2,
    },
  ];

  const featuresList = [
    {
      icon: "🎵",
      title: "10,000+ Songs",
      desc: "Bollywood, English, Pop, Regional — we have it all",
    },
    {
      icon: "🔒",
      title: "100% Private",
      desc: "Completely enclosed. Just you and your people",
    },
    {
      icon: "📦",
      title: "All-inclusive",
      desc: "Equipment, setup, and refreshments included",
    },
  ];

  return (
    <section className="py-[70px] md:py-[100px]" id="studios">
      <div className="max-w-[1200px] mx-auto px-[24px]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-40px" }}
        >
          <span className="inline-block text-[0.75rem] font-[600] tracking-[0.2em] uppercase text-gold mb-[12px] relative pl-[28px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[18px] before:h-[2px] before:bg-gold">
            Book Your Session
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] font-[800] leading-[1.15] mb-[16px]">
            Private <span className="gradient-text">Karaoke Studios</span>
          </h2>
          <p className="text-text-muted max-w-[520px] text-[0.95rem]">
            Two premium spaces designed for unforgettable performances — whether
            it&apos;s an intimate gathering or a full-house celebration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[28px] mt-[40px] md:mt-[60px]">
          {[...dbStudios].sort((a, b) => a.name.localeCompare(b.name)).map((dbStudio, idx) => {
            const isFirst = idx % 2 === 0;
            const studio = {
              id: dbStudio.id,
              name: dbStudio.name,
              tagline: dbStudio.description || (isFirst ? "Intimate vibes for close-knit celebrations" : "Go big — perfect for large groups and events"),
              maxGuests: dbStudio.capacity,
              price: dbStudio.pricePerHour,
              access: "Full",
              features: ["LED Screen", "Tea Included", "Pro Mic Setup", "AC", isFirst ? "Photo Ready" : "Party Setup"],
              image: dbStudio.image || (isFirst ? "/images/studio1.png" : "/images/studio2.png"),
              badge: isFirst ? "Popular" : "XL Space",
              badgeGradient: isFirst ? "bg-burgundy" : "bg-[linear-gradient(135deg,#00b4d8,#f72585)]",
              bgGradient: isFirst ? "bg-[rgba(0,0,0,0.2)]" : "bg-[linear-gradient(135deg,#0d1a2e,#1a0d2e)]",
              glowGradient: "radial-gradient(ellipse at center, rgba(122, 30, 37, 0.4), transparent 70%)",
              delay: 0.1 * (idx + 1),
            };

            return (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: studio.delay }}
                viewport={{ once: true, margin: "-40px" }}
                className="rounded-[24px] overflow-hidden border border-glass-border bg-glass-bg backdrop-blur-[16px] transition-all duration-500 ease-out cursor-pointer relative group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(216,154,43,0.15)] hover:border-[rgba(216,154,43,0.3)] flex flex-col"
              >
                <div
                  className={`h-[260px] relative overflow-hidden flex items-center justify-center bg-[#0a0a0a]`}
                >
                  <Image
                    src={studio.image}
                    alt={studio.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,11,18,0.9)] via-[rgba(13,11,18,0.2)] to-transparent z-10" />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 z-10 mix-blend-color-dodge"
                    style={{ background: studio.glowGradient }}
                  />
                  <div
                    className={`absolute top-[16px] right-[16px] ${studio.badgeGradient} text-white text-[0.75rem] font-[700] px-[14px] py-[5px] rounded-[100px] z-20`}
                  >
                    {studio.badge}
                  </div>
                </div>

                <div className="p-[32px]">
                  <h3 className="font-heading text-[1.5rem] font-[800] mb-[6px]">{studio.name}</h3>
                  <p className="text-text-muted text-[0.88rem] mb-[24px]">{studio.tagline}</p>

                  <div className="flex gap-[24px] mb-[24px]">
                    <div className="flex flex-col gap-[3px]">
                      <div className="font-heading text-[1.3rem] font-[700] text-gold">{studio.maxGuests}</div>
                      <div className="text-[0.75rem] text-text-muted">Max Guests</div>
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div className="font-heading text-[1.3rem] font-[700] text-gold">₹{studio.price.toLocaleString("en-IN")}</div>
                      <div className="text-[0.75rem] text-text-muted">Per Hour</div>
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div className="font-heading text-[1.3rem] font-[700] text-gold">{studio.access}</div>
                      <div className="text-[0.75rem] text-text-muted">Private Access</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-[8px] mb-[28px]">
                    {studio.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-[0.78rem] px-[12px] py-[5px] rounded-[100px] bg-[rgba(255,255,255,0.04)] border border-glass-border text-text-light flex items-center gap-[6px] transition-all duration-300 group-hover:bg-[rgba(255,255,255,0.08)] group-hover:border-[rgba(255,255,255,0.15)] group-hover:text-white before:content-['✨'] before:text-[0.7rem]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-[8px] px-[24px] py-[12px] rounded-[14px] font-body text-[0.9rem] font-[600] transition-all duration-500 relative overflow-hidden text-center cursor-pointer bg-[#FFD166] text-[#210B2C] border border-[rgba(255,209,102,0.15)] shadow-[0_8px_24px_rgba(255,209,102,0.18)] hover:bg-[#F4C852] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(255,209,102,0.25)] active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        setAuthModalOpen(true);
                      } else {
                        openBookingModal({ id: studio.id, name: studio.name, price: studio.price });
                      }
                    }}
                  >
                    Book Now →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature highlights row */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[20px] mt-[20px] md:mt-[40px]"
        >
          {featuresList.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-glass-bg border border-glass-border backdrop-blur-[20px] rounded-[20px] p-[24px] md:p-[28px] text-center shadow-lg"
            >
              <div className="text-[2rem] mb-[12px]">{feature.icon}</div>
              <div className="font-[700] font-heading mb-[6px]">{feature.title}</div>
              <div className="text-[0.82rem] text-text-muted">{feature.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}
