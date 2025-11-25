import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const testimonialRef = useRef(null);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // --- Newsletter Logic ---
  const handleSubscribe = async () => {
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }
    try {
      // Mock API call
      const response = await fetch("http://localhost:8080/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage("✅ Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage("⚠️ Subscription failed. Try again later.");
      }
    } catch (error) {
      setMessage("❌ Error connecting to server.");
    }
  };

  // --- Testimonial Scroll Logic ---
  const scrollTestimonials = (direction) => {
    if (testimonialRef.current) {
      const scrollAmount = 350; // Width of card + gap
      testimonialRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // --- Data for Testimonials (10 items) ---
  const testimonials = [
    { id: 1, name: "Sarah Lee", role: "LegalPro", review: "Saved us hours in legal review!", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "John Doe", role: "Tech Solutions", review: "Amazing tool for contract review!", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Emily Chen", role: "Innovate Law", review: "The AI insights are spot on.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Michael Ross", role: "Pearson Specter", review: "A game changer for our firm.", stars: "⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Rachel Zane", role: "Paralegal", review: "User interface is so intuitive.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=5" },
    { id: 6, name: "Harvey Specter", role: "Senior Partner", review: "Efficiency at its finest.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=6" },
    { id: 7, name: "Louis Litt", role: "Corporate Law", review: "It catches risks I might miss.", stars: "⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=7" },
    { id: 8, name: "Donna Paulsen", role: "COO", review: "Keeps everything organized.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=8" },
    { id: 9, name: "Jessica Pearson", role: "Managing Partner", review: "Professional and reliable.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=9" },
    { id: 10, name: "Alex Williams", role: "Startup Founder", review: "Essential for our small team.", stars: "⭐⭐⭐⭐⭐", img: "https://i.pravatar.cc/150?u=10" },
  ];

  // --- Image Arrays for Hero ---
  // Left: 1-8, Right: 9-16
  const leftImages = [1, 2, 3, 4, 5, 6, 7, 8];
  const rightImages = [9, 10, 11, 12, 13, 14, 15, 16];

  return (
    <div className="homepage">
      {/* Navbar */}
     <header className="hp-navbar">
        <div className="nav-logo">
          <img src="/favicon.ico" alt="Legalyze Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">Legalyze</span>
        </div>

        <nav>
          <a href="#">Home</a>
          <a href="#features">Features</a>
          <a href="#process">Process</a>
          <a href="#video-section">Resources</a>
          <a href="#testimonials">Testimonials</a>
        </nav>

        <div className="nav-buttons">
          {/* Join -> Signup (isLogin: false) */}
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/auth", { state: { isLogin: false } })}
          >
            Join
          </button>
          {/* Sign In -> Login (isLogin: true) */}
          <button 
            className="btn-primaryn" 
            onClick={() => navigate("/auth", { state: { isLogin: true } })}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Transform Your Legal Workflow With Legalyze</h1>
          <p>
            Legalyze offers AI-powered contract intelligence that streamlines
            your legal processes. Experience enhanced efficiency and accuracy
            with our intuitive platform designed for legal professionals.
          </p>

          <div className="hero-buttons">
            <button className="btn-primaryh" onClick={() => navigate("/auth", { state: { isLogin: false } })}>Get Started</button>
            <button className="btn-secondary" onClick={() => document.getElementById('features').scrollIntoView()}>Learn More</button>
          </div>
        </div>

        <div className="hero-carousel">
          {/* Left Column: Moves Downwards */}
          <div className="carousel-column left-col">
            <div className="track-down">
              {/* Doubled for seamless loop */}
              {[...leftImages, ...leftImages].map((i, idx) => (
                <img key={`l-${idx}`} src={`/hp${i}.png`} alt={`Contract ${i}`} />
              ))}
            </div>
          </div>

          {/* Right Column: Moves Upwards */}
          <div className="carousel-column right-col">
            <div className="track-up">
              {/* Doubled for seamless loop */}
              {[...rightImages, ...rightImages].map((i, idx) => (
                <img key={`r-${idx}`} src={`/hp${i}.png`} alt={`Contract ${i}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-left">
          <h2>Transform Your Legal Contract Management with AI-Powered Insights</h2>
          <p>Legalyze empowers organizations to efficiently scan legal contracts, uncovering hidden loopholes and assessing risk levels.</p>

          <div className="feature-item">
            <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Risk Icon" className="feature-icon" />
            <div>
              <h3>Risk Assessment</h3>
              <p>Get accurate risk scores to make informed decisions.</p>
            </div>
          </div>

          <div className="feature-item">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="Smart Icon" className="feature-icon" />
            <div>
              <h3>Smart Assistance</h3>
              <p>A friendly AI chatbot to answer your contract queries.</p>
            </div>
          </div>
        </div>

        <div className="features-right">
          <div className="image-placeholder">
            <img src="/feature.png" alt="Feature Illustration" className="feature-image" />
          </div>
        </div>
      </section>

      {/* Video Section (New) */}
      <section id="video-section" className="video-section">
        <h2 className="video-title">See Legalyze in Action</h2>
        <div className="video-container">
          
          {/* Left Video: How to use */}
          <div className="video-card">
            <h3>Platform Demo</h3>
            <video 
              src="/legalyze.mp4" /* Ensure this file exists in public folder */
              className="styled-video"
              autoPlay 
              loop 
              muted 
              playsInline
              controls
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right Video: Avatar Explainer */}
          <div className="video-card">
            <h3>AI Assistant Guide</h3>
            <video 
              src="/legalyze.mp4" /* Ensure this file exists in public folder */
              className="styled-video"
              autoPlay 
              loop 
              muted 
              playsInline
              controls
            >
              Your browser does not support the video tag.
            </video>
          </div>

        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="process">
        <div className="process-left">
          <h2>Transform Your Contract Management Experience</h2>
          <p>Legalyze offers a suite of powerful features designed to enhance legal workflow efficiency.</p>
          <div className="process-buttons">
            <button className="btn-secondary">Learn More</button>
            <button className="btn-link" onClick={() => navigate("/auth", { state: { isLogin: false } })}>Sign Up →</button>
          </div>
        </div>

        <div className="process-right">
          <div className="process-item">
            <img src="https://cdn-icons-png.flaticon.com/512/1091/1091936.png" alt="Upload Icon" className="process-icon" />
            <div><h3>Effortless Document Upload</h3><p>Easily upload contracts with our intuitive interface.</p></div>
          </div>
          <div className="process-item">
            <img src="https://cdn-icons-png.flaticon.com/512/1827/1827504.png" alt="Preference Icon" className="process-icon" />
            <div><h3>Personalized Preferences</h3><p>Customize the platform to suit your needs.</p></div>
          </div>
          <div className="process-item">
            <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" alt="Clause Icon" className="process-icon" />
            <div><h3>Clause Risk Scoring</h3><p>Assess potential contract risks instantly.</p></div>
          </div>
          <div className="process-item">
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828919.png" alt="Summary Icon" className="process-icon" />
            <div><h3>Insightful Summary Cards</h3><p>Get concise summaries of contract key points.</p></div>
          </div>
        </div>
      </section>

      {/* Testimonials (Updated) */}
      <section id="testimonials" className="testimonials">
        <div className="testimonial-header">
          <h2>Trusted by Legal Professionals</h2>
          <div className="testimonial-controls">
            <button onClick={() => scrollTestimonials("left")}>←</button>
            <button onClick={() => scrollTestimonials("right")}>→</button>
          </div>
        </div>

        <div className="testimonial-carousel" ref={testimonialRef}>
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div className="t-stars">{item.stars}</div>
              <p className="t-review">"{item.review}"</p>
              <div className="t-profile">
                <img src={item.img} alt={item.name} className="t-avatar" />
                <div>
                  <span className="t-name">{item.name}</span>
                  <span className="t-org">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter (Updated) */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>Stay Ahead of the Curve</h2>
          <p>Join our exclusive list to get the latest in Legal Tech & AI.</p>

          <div className="newsletter-form">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-primarye" onClick={handleSubscribe}>
              Subscribe
            </button>
          </div>
          {message && <p className="newsletter-msg">{message}</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <div><h4>Quick Links</h4><a href="#">Home</a><a href="#features">Features</a><a href="#video-section">Resources</a></div>
          <div><h4>Company</h4><a href="#">About Us</a><a href="#">Contact</a></div>
          <div><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a></div>
        </div>
        <p>© 2025 Legalyze. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;