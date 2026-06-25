"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-text-muted mb-[40px]">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-invert prose-gold max-w-none space-y-[32px]">
              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">1. Information We Collect</h2>
                <p className="text-text-light leading-[1.8]">
                  When you use Nukkad Beats, we may collect the following types of information:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li><strong>Personal Information:</strong> Name, email address, phone number provided during registration or booking.</li>
                  <li><strong>Account Information:</strong> Google Sign-In data if you choose to authenticate via Google.</li>
                  <li><strong>Transaction Data:</strong> Booking history, payment records, and café order history.</li>
                  <li><strong>Technical Data:</strong> IP address, device information, and login timestamps collected via server logs.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">2. How We Use Your Information</h2>
                <p className="text-text-light leading-[1.8]">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc pl-[24px] text-text-light leading-[1.8] mt-[12px] space-y-[8px]">
                  <li>To facilitate studio bookings and café orders.</li>
                  <li>To securely process payments via our payment gateway (Razorpay).</li>
                  <li>To send necessary notifications (via Email or WhatsApp) regarding your bookings, payments, and account security.</li>
                  <li>To improve our website, user experience, and overall service quality.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">3. Payment Processing</h2>
                <p className="text-text-light leading-[1.8]">
                  All online payments are processed securely by <strong>Razorpay</strong>. We do not store your credit/debit card numbers or sensitive banking details on our servers. Payment details are handled directly by the payment gateway in accordance with their privacy and security standards.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">4. Third-Party Services</h2>
                <p className="text-text-light leading-[1.8]">
                  We use third-party services like Google (for authentication) and Razorpay (for payments). These services only receive the information necessary to perform their specific functions. We do not sell, rent, or trade your personal information to outside parties.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">5. Data Security</h2>
                <p className="text-text-light leading-[1.8]">
                  We implement appropriate technical and organizational security measures to protect your personal information. Passwords are securely hashed and never stored in plain text. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">6. Your Rights</h2>
                <p className="text-text-light leading-[1.8]">
                  You have the right to access, update, correct, or request the deletion of your personal data. You can manage your profile within your account dashboard. For data deletion requests, please contact us using the details below.
                </p>
              </section>

              <section>
                <h2 className="text-[1.5rem] font-[700] text-white mb-[16px]">7. Contact Us</h2>
                <p className="text-text-light leading-[1.8]">
                  If you have any questions or concerns about this Privacy Policy, please contact us at:
                  <br /><br />
                  <strong>Email:</strong> support@nukkadbeats.com<br />
                  <strong>Phone:</strong> +91 [YOUR_PHONE_NUMBER]<br />
                  <strong>Address:</strong> [YOUR_BUSINESS_ADDRESS]
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
