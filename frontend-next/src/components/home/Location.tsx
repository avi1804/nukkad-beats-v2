"use client";

export default function Location() {
  return (
    <section className="location section" id="location">
      <div className="container">
        <div data-reveal>
          <span className="section-label">Find Us</span>
          <h2 className="section-title">
            We're in the <span className="gradient-text">Heart of the City</span>
          </h2>
        </div>

        <div className="location-grid">
          <div className="map-container" data-reveal data-reveal-delay="1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3671.895981121068!2d72.54156727531404!3d23.02759117917027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDAxJzM5LjMiTiA3MsKwMzInMzguOSJF!5e0!3m2!1sen!2sin!4v1781378715103!5m2!1sen!2sin"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="map-overlay">
              <div className="map-pin-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="#EA4335"
                  stroke="#c5221f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="#fff" stroke="none"></circle>
                </svg>
              </div>
              <div className="map-overlay-text">Nukkad Beats HQ</div>
              <a
                href="https://maps.app.goo.gl/9Md9yzxWA68tJJC67"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Open Maps ↗
              </a>
            </div>
          </div>

          <div className="location-info" data-reveal data-reveal-delay="2">
            <div className="location-detail">
              <div className="location-detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <div className="location-detail-title">Address</div>
                <div className="location-detail-text">
                  102, Sigma Legacy, Above Gallops Hyundai Showroom,
                  <br />
                  Panjrapol Char Rasta, IIM Road, Ambawadi, Ahmedabad 380015
                </div>
              </div>
            </div>

            <div className="location-detail">
              <div className="location-detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <div className="location-detail-title">Business Hours</div>
                <div className="location-detail-text">
                  Mon – Thu: 11:00 AM – 11:00 PM
                  <br />
                  Fri – Sun: 11:00 AM – 1:00 AM
                  <br />
                  <span style={{ color: "var(--purple)", fontWeight: 600 }}>
                    Now Open
                  </span>
                </div>
              </div>
            </div>

            <div className="location-detail">
              <div className="location-detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--gold)" }}
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div>
                <div className="location-detail-title">Parking</div>
                <div className="location-detail-text">
                  Free parking available for up to 50 vehicles. Valet on weekends.
                </div>
              </div>
            </div>

            <div className="location-detail">
              <div className="location-detail-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                <div className="location-detail-title">Quick Contact</div>
                <div className="location-detail-text">
                  +91 96443 97658 · nukkadbeatsofficial@gmail.com
                </div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/9Md9yzxWA68tJJC67"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
