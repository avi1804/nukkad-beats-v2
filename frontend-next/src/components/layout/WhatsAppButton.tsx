"use client";

export default function WhatsAppButton() {
  return (
    <div className="hidden md:block">
      <a
        href="https://wa.me/919644397658"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Chat on WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          width="60"
          height="60"
        />
      </a>
    </div>
  );
}
