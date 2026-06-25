"use client";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "P",
    gradient: "linear-gradient(135deg, #9b5de5, #f72585)",
    date: "2 weeks ago",
    rating: 5,
    text: "Booked Studio 2 for my birthday and it was INSANE. The LED setup, the sound quality — we literally didn't want to leave. 10/10 experience!",
  },
  {
    id: 2,
    name: "Rohan Mehta",
    avatar: "R",
    gradient: "linear-gradient(135deg, #00b4d8, #9b5de5)",
    date: "1 month ago",
    rating: 5,
    text: "First time at a karaoke studio and I was blown away. The staff was super helpful, the café food was amazing, and the vibe was premium AF.",
  },
  {
    id: 3,
    name: "Ananya Patel",
    avatar: "A",
    gradient: "linear-gradient(135deg, #f72585, #00b4d8)",
    date: "3 weeks ago",
    rating: 5,
    text: "The Biscoff cheesecake from the café paired with a hot chocolate while we belted Bollywood hits? That's the Nukkad Beats formula and it WORKS.",
  },
  {
    id: 4,
    name: "Karan Joshi",
    avatar: "K",
    gradient: "linear-gradient(135deg, #9b5de5, #00b4d8)",
    date: "5 weeks ago",
    rating: 5,
    text: "Corporate team outing at Studio 2 — booked for 3 hours and it was the most fun our team has had in years. Already planning the next one!",
  },
  {
    id: 5,
    name: "Neha Kapoor",
    avatar: "N",
    gradient: "linear-gradient(135deg, #f72585, #9b5de5)",
    date: "2 months ago",
    rating: 5,
    text: "The booking process was super easy and the confirmation was instant. Arrived to a beautifully lit studio and left with memories I'll cherish forever.",
  },
  {
    id: 6,
    name: "Vikram Singh",
    avatar: "V",
    gradient: "linear-gradient(135deg, #00b4d8, #f72585)",
    date: "6 weeks ago",
    rating: 4,
    text: "Song library is enormous — we found every Arijit Singh song we wanted. The tea was a lovely touch. Highly recommend the bubble tea from the café!",
  },
];

export default function Testimonials() {
  // Duplicate testimonials for seamless infinite scroll
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div data-reveal>
          <span className="section-label">What People Say</span>
          <h2 className="section-title">
            Love from Our <span className="gradient-text">Guests</span>
          </h2>
        </div>
      </div>

      <div style={{ overflow: "hidden", padding: "40px 0" }}>
        <div className="testimonials-track">
          {allTestimonials.map((testimonial, index) => (
            <div key={`${testimonial.id}-${index}`} className="testimonial-card">
              <div className="testimonial-top">
                <div
                  className="testimonial-avatar"
                  style={{ background: testimonial.gradient }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-date">{testimonial.date}</div>
                </div>
              </div>
              <div className="testimonial-stars">
                {"★".repeat(testimonial.rating)}
                {"☆".repeat(5 - testimonial.rating)}
              </div>
              <div className="testimonial-text">{testimonial.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
