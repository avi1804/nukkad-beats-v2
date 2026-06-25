"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function RefundsPage() {
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
              Cancellation & <span className="gradient-text">Refund Policy</span>
            </h1>
            <p className="text-text-muted mb-[40px]">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-invert prose-gold max-w-none space-y-[32px]">
              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">1. Studio Booking Cancellations</h2>
                <p className="text-text-light leading-[1.8]">
                  We understand that plans can change. You can cancel your studio booking subject to the following conditions:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li><strong>More than 24 hours notice:</strong> 100% refund of the booking amount.</li>
                  <li><strong>Between 12 to 24 hours notice:</strong> 50% refund of the booking amount.</li>
                  <li><strong>Less than 12 hours notice:</strong> No refund will be provided.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">2. Café & Food Orders</h2>
                <p className="text-text-light leading-[1.8]">
                  Due to the perishable nature of food and beverages, our policy on café orders is strict:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li>Food pre-orders attached to a studio booking can only be cancelled if the studio booking is cancelled at least 6 hours in advance.</li>
                  <li>Standalone food orders placed on-site or online for immediate consumption cannot be cancelled or refunded once preparation has begun.</li>
                  <li>If an item you ordered is out of stock, we will offer a replacement or issue a full refund for that specific item.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">3. No-Show Policy</h2>
                <p className="text-text-light leading-[1.8]">
                  If you fail to arrive for your scheduled studio booking without prior cancellation notice ("no-show"), you will forfeit the entire booking amount and any associated food pre-orders.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">4. Refund Processing</h2>
                <p className="text-text-light leading-[1.8]">
                  Approved refunds will be processed back to the original payment method. Please allow 5-7 business days for the amount to reflect in your bank account, depending on your card issuer or bank.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">5. How to Request a Refund</h2>
                <p className="text-text-light leading-[1.8]">
                  To request a cancellation or refund, please reach out to us as soon as possible:
                  <br /><br />
                  <strong>Email:</strong> support@nukkadbeats.com<br />
                  <strong>Phone:</strong> +91 [YOUR_PHONE_NUMBER]
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
