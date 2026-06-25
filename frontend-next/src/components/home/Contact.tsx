"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const waNumber = "919644397658";
    const text = `Hi, I'm ${formData.name}.\n\n*Subject:* ${formData.subject || "General Enquiry"}\n*Message:*\n${formData.message}\n\n*My Contact Info:*\nPhone: ${formData.phone || 'N/A'}\nEmail: ${formData.email || 'N/A'}`;
    
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    
    // Open WhatsApp in a new tab
    window.open(waUrl, "_blank");

    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div data-reveal>
          <span className="section-label">Get in Touch</span>
          <h2 className="section-title">
            Let's Make Some <span className="gradient-text">Noise Together</span>
          </h2>
        </div>

        <div className="contact-grid">
          <div className="contact-info" data-reveal>
            <div>
              <h3 className="contact-info-title">Say hello or plan your visit</h3>
              <p className="contact-info-desc">
                Have questions about bookings, group packages, or just want to know
                more about what we offer? We'd love to hear from you.
              </p>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--gold)" }}
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div>
                <div className="contact-item-text">+91 96443 97658</div>
                <div className="contact-item-label">Call or WhatsApp</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--gold)" }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <div className="contact-item-text">nukkadbeatsofficial@gmail.com</div>
                <div className="contact-item-label">We reply within 24 hrs</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--gold)" }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <div className="contact-item-text">
                  102, Sigma Legacy, Above Gallops Hyundai Showroom, Panjrapol Char
                  Rasta, IIM Road, Ambawadi, Ahmedabad 380015
                </div>
                <div className="contact-item-label">Walk-ins welcome during hours</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--gold)" }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <div className="contact-item-text">11 AM – 11 PM (Mon–Thu)</div>
                <div className="contact-item-label">11 AM – 1 AM (Fri–Sun)</div>
              </div>
            </div>
          </div>

          <div className="contact-form" data-reveal data-reveal-delay="2">
            <h3>Send a Message</h3>
            <form id="contact-form" onSubmit={handleSubmit}>
              <div
                className="form-group"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
              >
                <div>
                  <label htmlFor="cf-name">Your Name</label>
                  <input
                    type="text"
                    id="cf-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Kumar"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cf-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="cf-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 96443 97658"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="cf-email">Email</label>
                <input
                  type="email"
                  id="cf-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@email.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-subject">What's this about?</label>
                <select
                  id="cf-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select a topic</option>
                  <option>Studio Booking Query</option>
                  <option>Group / Event Package</option>
                  <option>Café & Food</option>
                  <option>Corporate Bookings</option>
                  <option>General Enquiry</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cf-message">Message</label>
                <textarea
                  className="form-group-input"
                  id="cf-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you're planning…"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Send Message 📩
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
