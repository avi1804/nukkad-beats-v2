"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-text-muted mb-[40px]">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-invert prose-gold max-w-none space-y-[32px]">
              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">1. Acceptance of Terms</h2>
                <p className="text-text-light leading-[1.8]">
                  By accessing or using the Nukkad Beats website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">2. Studio Booking Rules</h2>
                <p className="text-text-light leading-[1.8]">
                  When booking a studio session:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li>Bookings are subject to availability and confirmation.</li>
                  <li>Please arrive at least 15 minutes prior to your scheduled time.</li>
                  <li>Any damage caused to the studio equipment during your session will be billed to you.</li>
                  <li>We reserve the right to cancel or modify bookings in extreme circumstances.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">3. Payment Terms</h2>
                <p className="text-text-light leading-[1.8]">
                  Payment must be completed in full to confirm your booking and café orders. All prices listed are in Indian Rupees (INR) unless otherwise specified. We accept payments via UPI, Credit/Debit cards, and NetBanking through Razorpay.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">4. User Responsibilities</h2>
                <p className="text-text-light leading-[1.8]">
                  As a user of Nukkad Beats, you agree to:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li>Provide accurate and complete information during registration and booking.</li>
                  <li>Maintain the confidentiality of your account credentials.</li>
                  <li>Behave respectfully towards staff and other guests while on the premises.</li>
                  <li>Not use the studio for any illegal or prohibited activities.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">5. Limitation of Liability</h2>
                <p className="text-text-light leading-[1.8]">
                  Nukkad Beats is not liable for any personal injury, loss, or damage to personal property while on our premises, except where such liability cannot be excluded by law. Our total liability for any claim arising out of your use of our services shall not exceed the amount paid by you for the specific booking or order.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">6. Changes to Terms</h2>
                <p className="text-text-light leading-[1.8]">
                  We reserve the right to update or modify these Terms & Conditions at any time. Your continued use of the website following any changes indicates your acceptance of the new terms.
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
