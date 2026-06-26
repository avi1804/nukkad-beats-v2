"use client";

import { useState } from "react";
import Image from "next/image";

const galleryItems = [
  {
    id: 1,
    caption: "Studio Session Vibes",
    icon: "🎤",
    label: "Studio Session",
    height: "260px",
    src: "/images/DSCF8432.JPG",

  },
  {
    id: 2,
    caption: "Birthday Bash",
    icon: "🎂",
    label: "Birthday Bash",
    height: "260px",
    src: "/images/birthday.jpg"
  },
  {
    id: 3,
    caption: "Café Corner",
    icon: "☕",
    label: "Café Corner",
    height: "260px",
    src: "/images/DSCF8411.JPG",
  },
  {
    id: 4,
    caption: "Friends & Music",
    icon: "👫",
    label: "Friends & Music",
    height: "260px",
    src: "/images/DSCF9275.JPG",

  },
  {
    id: 5,
    caption: "LED Nights",
    icon: "🌟",
    label: "LED Nights",
    height: "260px",
    src: "/images/DSCF8388.JPG",

  },
  {
    id: 6,
    caption: "Sing-Along Fun",
    icon: "🎵",
    label: "Sing-Along",
    height: "260px",
    src: "/images/DSCF8392.JPG",

  },
  {
    id: 7,
    caption: "Group Celebrations",
    icon: "🎊",
    label: "Celebrations",
    height: "260px",
    src: "/images/DSCF8766.JPG",
  },
  {
    id: 8,
    caption: "Food & Vibes",
    icon: "🍕",
    label: "Food & Vibes",
    height: "260px",
    src: "/images/cafefood.JPG",
  },
];

export default function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

  const openLightbox = (item: typeof galleryItems[0]) => {
    setSelectedImage(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  return (
    <section className="gallery section" id="gallery">
      <div className="container">
        <div data-reveal>
          <span className="section-label">Moments & Memories</span>
          <h2 className="section-title">
            The <span className="gradient-text">Nukkad Experience</span>
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              maxWidth: "520px",
              margin: "0 auto",
              fontSize: "0.95rem",
            }}
          >
            Every visit is a story. Peek inside the magic — studio sessions,
            birthday surprises, and café moments worth sharing.
          </p>
        </div>

        <div className="gallery-grid" data-reveal>
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="gallery-item relative overflow-hidden group"
              data-caption={item.caption}
              style={{ height: item.height, cursor: "pointer" }}
              onClick={() => openLightbox(item)}
            >
              {item.src ? (
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/40" />
                </div>
              ) : (
                <div className="gallery-placeholder" style={{ height: item.height }}>
                  <span className="gp-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )}
              <div className="gallery-overlay z-10 relative">
                <span className="gallery-caption">{item.caption} {item.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }} data-reveal>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginBottom: "16px",
            }}
          >
            📸 More real photos uploading soon — follow us for a sneak peek
          </p>
          <a href="https://www.instagram.com/nukkad_beats?igsh=MWVhcnRiNW8zOHNmeA%3D%3D" className="btn btn-outline">
            Follow on Instagram ↗
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="lightbox-content relative bg-[#0B0B0F]/95 border border-white/10 rounded-2xl p-6 md:p-8 max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
              onClick={closeLightbox}
            >
              ✕
            </button>
            {selectedImage && (
              <div className="flex flex-col items-center w-full h-full">
                {selectedImage.src ? (
                  <div className="relative w-full h-[50vh] md:h-[65vh] mb-6 rounded-xl overflow-hidden border border-white/5">
                    <Image
                      src={selectedImage.src}
                      alt={selectedImage.caption}
                      fill
                      className="object-contain bg-black/50"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "4rem",
                      marginBottom: "1rem",
                      padding: "4rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "1rem"
                    }}
                  >
                    {selectedImage.icon}
                  </div>
                )}
                <h3 className="text-2xl font-bold font-heading text-white mb-2">{selectedImage.caption}</h3>
                <p className="text-gold/80 font-medium">
                  {selectedImage.label}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
