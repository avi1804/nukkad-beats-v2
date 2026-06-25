"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Studios from "@/components/home/Studios";
import Cafe from "@/components/home/Cafe";
import Gallery from "@/components/home/Gallery";
import Testimonials from "@/components/home/Testimonials";
import Location from "@/components/home/Location";
import Contact from "@/components/home/Contact";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { useScrollReveal } from "@/lib/useScrollReveal";

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Studios />
        <Cafe />
        <Gallery />
        <Testimonials />
        <Location />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
