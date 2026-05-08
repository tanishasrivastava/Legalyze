import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const AUTH_API = import.meta.env.VITE_AUTH_API;
const AI_API = import.meta.env.VITE_AI_API;

function HomePage() {
  const navigate = useNavigate();
  const testimonialRef = useRef(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [signInPopup, setSignInPopup] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  /* ── Intersection Observer for scroll animations ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [e.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".observe-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Newsletter ── */
  const handleSubscribe = async () => {
    if (!email) { setMessage("Please enter a valid email."); return; }
    try {
     const res = await fetch(`${AUTH_API}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage(res.ok ? "✅ Thank you for subscribing!" : "⚠️ Subscription failed. Try again.");
      if (res.ok) setEmail("");
    } catch {
      setMessage("❌ Error connecting to server.");
    }
  };

  /* ── Testimonials ── */
  const testimonials = [
    { id: 1, name: "Priya Sharma", role: "Senior Legal Counsel, Tata Consultancy", review: "Legalyze flagged three critical indemnification clauses in our vendor agreement that our team had missed. The AI insights saved us from a potentially catastrophic liability. This is now mandatory in our legal review process.", stars: 5, location: "Mumbai, India", img: "https://i.pravatar.cc/150?u=priya1" },
    { id: 2, name: "James Whitmore", role: "Partner, Morrison & Whitmore LLP", review: "The contract intelligence suite is genuinely impressive. The negotiation coach gave us leverage points we hadn't considered, and the timeline generator auto-extracts every deadline. It's reduced our review time by 65%.", stars: 5, location: "London, UK", img: "https://i.pravatar.cc/150?u=james2" },
    { id: 3, name: "Aditi Krishnamurthy", role: "Chief Legal Officer, Razorpay", review: "We process thousands of contracts monthly. Legalyze integrates seamlessly into our workflow — the risk scoring is consistently accurate and the ambiguity detector caught a clause that could have led to a major dispute.", stars: 5, location: "Bengaluru, India", img: "https://i.pravatar.cc/150?u=aditi3" },
    { id: 4, name: "Marcus Chen", role: "VP Legal, Stripe APAC", review: "The financial exposure calculator gave our CFO exactly the numbers needed to make the call on a high-value SaaS contract. Clear, defensible, accurate. This tool pays for itself in the first contract it reviews.", stars: 5, location: "Singapore", img: "https://i.pravatar.cc/150?u=marcus4" },
    { id: 5, name: "Fatima Al-Hassan", role: "Corporate Lawyer, Al Tamimi & Company", review: "As a lawyer dealing with cross-border contracts, the jurisdiction analysis and compliance checker are invaluable. The certificate feature alone has transformed how I present risk summaries to clients.", stars: 5, location: "Dubai, UAE", img: "https://i.pravatar.cc/150?u=fatima5" },
    { id: 6, name: "Rohit Mehta", role: "Founder & CEO, LawStack", review: "We built our legal tech startup on top of Legalyze's API. The accuracy of the AI analysis is unlike anything else on the market. Our clients trust it because it consistently delivers at a senior associate level.", stars: 5, location: "Pune, India", img: "https://i.pravatar.cc/150?u=rohit6" },
    { id: 7, name: "Sophie Laurent", role: "Legal Director, LVMH Group", review: "The escape route mapper is a brilliant innovation. Identifying exit strategies across 80+ contract types, automatically — it's something that used to take our team days. Now it's minutes.", stars: 5, location: "Paris, France", img: "https://i.pravatar.cc/150?u=sophie7" },
    { id: 8, name: "Kiran Desai", role: "Freelance Contract Lawyer", review: "As an independent practitioner, Legalyze is my competitive edge. I can offer clients enterprise-grade contract review at a fraction of the cost of a big firm. The voice assistant is genuinely useful during client calls.", stars: 5, location: "Ahmedabad, India", img: "https://i.pravatar.cc/150?u=kiran8" },
  ];

  const nextTestimonial = () => setActiveTestimonial((p) => (p + 1) % testimonials.length);
  const prevTestimonial = () => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);

  /* ── Hero image data ── */
  const leftImages = [1, 2, 3, 4, 5, 6, 7, 8];
  const rightImages = [9, 10, 11, 12, 13, 14, 15, 16];

  /* ── Tools ── */
  const tools = [
    { id: "timeline", title: "AI Legal Timeline Generator", desc: "Extract all deadlines, obligations, and key dates from your contract.", tag: "Deadlines & Obligations", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: "voice", title: "AI Voice Legal Assistant", desc: "Ask questions about your contract using natural language.", tag: "Voice Interaction", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
    { id: "ambiguity", title: "AI Ambiguity Detector", desc: "Detect vague and legally ambiguous language. Get precise rewrites.", tag: "Legal Intelligence", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { id: "negotiation", title: "AI Contract Negotiation Coach", desc: "Get strategic advice on which clauses to negotiate before signing.", tag: "Pre-Signing Strategy", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: "certificate", title: "Pre-Signing Risk Certificate", desc: "Generate a safety certificate with risk score and compliance rating.", tag: "Compliance Report", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: "compliance", title: "AI Compliance Checker", desc: "Verify your contract against GDPR, labor laws, and regulatory frameworks.", tag: "Regulatory Compliance", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { id: "executive", title: "Executive Summary Generator", desc: "Generate a one-page executive briefing for stakeholders.", tag: "Stakeholder Report", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: "financial", title: "AI Financial Exposure Calculator", desc: "Calculate total financial exposure including penalties and worst-case liability.", tag: "Cost Analysis", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id: "escape", title: "AI Escape Route Mapper", desc: "Map every exit strategy — termination rights, force majeure, and cooling-off periods.", tag: "Exit Strategy", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> },
    { id: "simulator", title: "What-If Scenario Simulator", desc: "Simulate late payments, early exit, or breach — see exactly what happens.", tag: "Risk Simulation", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  ];

  const features = [
    { icon: "⚡", title: "Instant Risk Scoring", desc: "Get precise risk scores across every clause in under 60 seconds. No guesswork — just data-driven legal clarity." },
    { icon: "🛡️", title: "Multi-layer Compliance", desc: "Cross-reference against GDPR, labor laws, and industry standards simultaneously." },
    { icon: "🤖", title: "Smart AI Assistant", desc: "Ask any question about your contract in plain English and get legally precise, cited answers." },
    { icon: "📊", title: "Visual Analytics", desc: "Beautifully visualized risk distributions, favorability scales, and financial exposure breakdowns." },
  ];

  const processSteps = [
    { num: "01", title: "Upload Your Contract", desc: "Drop any PDF contract into Legalyze. Our extraction engine processes it in seconds, preserving all clause structures and legal formatting.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
    { num: "02", title: "Select Your Perspective", desc: "Tell Legalyze which party you represent. The AI tailors every insight, risk flag, and recommendation specifically for your position.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { num: "03", title: "Review AI Insights", desc: "Receive a comprehensive analysis: risk scores, flagged clauses, safe clauses, favorability charts, and actionable suggestions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
    { num: "04", title: "Use Advanced Tools", desc: "Run any of the 10 specialized AI tools — negotiate better, generate certificates, simulate scenarios, and export reports.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  ];

  return (
    <div className="homepage">

      {/* ── Sign-In Popup ── */}
      {signInPopup && (
        <div className="hp-signin-overlay" onClick={() => setSignInPopup(false)}>
          <div className="hp-signin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="hp-signin-close" onClick={() => setSignInPopup(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="hp-signin-glow" />

            <div className="hp-signin-badge">
              <span className="hp-signin-badge-dot" />
              AI-Powered Legal Intelligence
            </div>

            <div className="hp-signin-icon-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>

            <h2 className="hp-signin-title">Unlock This Tool</h2>
            <p className="hp-signin-sub">
              Sign in to access the full Contract Intelligence Suite — it only takes a few minutes to get started.
            </p>

            <div className="hp-signin-perks">
              {["10 advanced AI tools", "Unlimited contract analysis", "Risk certificates & reports", "Team collaboration"].map((p, i) => (
                <div key={i} className="hp-signin-perk">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {p}
                </div>
              ))}
            </div>

            <div className="hp-signin-actions">
              <button
                className="hp-signin-cta"
                onClick={() => navigate("/auth", { state: { isLogin: false } })}
              >
                Create Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </button>
              <button
                className="hp-signin-secondary"
                onClick={() => navigate("/auth", { state: { isLogin: true } })}
              >
                I already have an account
              </button>
            </div>

            <p className="hp-signin-footnote">No credit card required · Free to start</p>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
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
          <button className="btn-secondary" onClick={() => navigate("/auth", { state: { isLogin: false } })}>Join</button>
          <button className="btn-primaryn" onClick={() => navigate("/auth", { state: { isLogin: true } })}>Sign In</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Trusted by 10,000+ legal professionals
          </div>
          <h1>Transform Your Legal Workflow With Legalyze</h1>
          <p>Legalyze offers AI-powered contract intelligence that streamlines your legal processes. Experience enhanced efficiency and accuracy with our intuitive platform.</p>
          <div className="hero-buttons">
            <button className="btn-primaryh" onClick={() => navigate("/auth", { state: { isLogin: false } })}>
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </button>
          </div>
          <div className="hero-stats">
            {[["10+", "AI Tools"], ["65%", "Faster Reviews"], ["10k+", "Contracts Analyzed"]].map(([val, label]) => (
              <div key={label} className="hero-stat">
                <span className="hero-stat-val">{val}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-carousel">
          <div className="carousel-column left-col">
            <div className="track-down">
              {[...leftImages, ...leftImages].map((i, idx) => (
                <img key={`l-${idx}`} src={`/hp${i}.png`} alt={`Contract ${i}`} />
              ))}
            </div>
          </div>
          <div className="carousel-column right-col">
            <div className="track-up">
              {[...rightImages, ...rightImages].map((i, idx) => (
                <img key={`r-${idx}`} src={`/hp${i}.png`} alt={`Contract ${i}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className={`hp-features observe-section ${visibleSections["features"] ? "in-view" : ""}`}
      >
        <div className="hp-features-inner">
          <div className="hp-features-left">
            <div className="hp-section-eyebrow">Why Legalyze</div>
            <h2>Contract intelligence that works as hard as you do</h2>
            <p>From risk scoring to negotiation coaching — every feature is built for legal professionals who demand precision.</p>
            <button className="hp-features-cta" onClick={() => navigate("/auth", { state: { isLogin: false } })}>
              Start analyzing contracts
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>

          <div className="hp-features-right">
            {features.map((f, i) => (
              <div key={i} className="hp-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="hp-feature-card-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video Section ── */}
      <section
        id="video-section"
        className={`hp-video observe-section ${visibleSections["video-section"] ? "in-view" : ""}`}
      >
        <div className="hp-video-inner">
          <div className="hp-section-eyebrow center">See It In Action</div>
          <h2 className="hp-video-title">Watch Legalyze analyze a real contract</h2>
          <p className="hp-video-sub">From upload to full AI analysis in under 2 minutes. No setup, no training required.</p>

          <div className="hp-video-grid">
            <div className="hp-video-card featured">
              <div className="hp-video-label">
                <span className="hp-video-live-dot" />
                Platform Demo
              </div>
              <video src="/legalyze.mp4" className="hp-video-el" autoPlay loop muted playsInline controls />
              <div className="hp-video-caption">Full contract analysis walkthrough</div>
            </div>
            <div className="hp-video-card">
              <div className="hp-video-label">AI Assistant Guide</div>
              <video src="/legalyze.mp4" className="hp-video-el" autoPlay loop muted playsInline controls />
              <div className="hp-video-caption">Voice assistant & chatbot features</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Advanced Tools ── */}
      <section className="advanced-tools">
        <div className="tools-container">
          <div className="tools-header">
            <div className="hp-section-eyebrow light">10 AI Tools Included</div>
            <h2>Contract <span className="text-primary-blue">Intelligence Suite</span></h2>
            <p>Go beyond basic analysis. Every tool works on any contract — no re-upload required after your first analysis.</p>
          </div>

          <div className="tools-grid">
            {tools.map((tool) => (
              <div key={tool.id} className="tool-card" onClick={() => setSignInPopup(true)}>
                <div className={`tool-icon-wrapper ${tool.id}-bg`}>{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <div className="tool-footer">
                  <span className="tool-tag">{tool.tag}</span>
                  <span className="tool-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section
        id="process"
        className={`hp-process observe-section ${visibleSections["process"] ? "in-view" : ""}`}
      >
        <div className="hp-process-inner">
          <div className="hp-process-header">
            <div className="hp-section-eyebrow">How It Works</div>
            <h2>From contract to insights in four steps</h2>
            <p>No legal expertise required. Legalyze guides you from raw document to actionable strategy.</p>
          </div>

          <div className="hp-process-steps">
            {processSteps.map((step, i) => (
              <div key={i} className="hp-process-step" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="hp-step-connector">
                  <div className="hp-step-num">{step.num}</div>
                  {i < processSteps.length - 1 && <div className="hp-step-line" />}
                </div>
                <div className="hp-step-content">
                  <div className="hp-step-icon">{step.icon}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Usertype ── */}
      <section className="usertype-section">
        <div className="usertype-header">
          <h2>Built for <span className="text-gradient">Individuals & Teams</span></h2>
          <p>Whether you're a solo professional or a large team, Legalyze adapts to your workflow.</p>
        </div>
        <div className="usertype-grid">
          <div className="usertype-card">
            <div className="u-icon-box bg-accent">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3>Individual</h3>
            <p className="u-desc">Perfect for freelancers, solo lawyers, and individual professionals who need fast, AI-powered contract review.</p>
            <ul className="u-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Personal dashboard</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> Unlimited contract analysis</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Real-time editing</li>
            </ul>
            <button className="u-btn-secondary" onClick={() => navigate("/auth")}>Get Started Free</button>
          </div>
          <div className="usertype-card popular-card">
            <div className="popular-badge">Popular</div>
            <div className="u-icon-box bg-primary-light">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
            </div>
            <h3>Business</h3>
            <p className="u-desc">For teams and organizations that need collaborative contract review with shared workspaces.</p>
            <ul className="u-list">
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Create teams & invite members</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Collaborative viewing & editing</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Email invitations</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Admin controls & permissions</li>
            </ul>
            <button className="u-btn-primary" onClick={() => navigate("/auth")}>Start with Business</button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        id="testimonials"
        className={`hp-testimonials observe-section ${visibleSections["testimonials"] ? "in-view" : ""}`}
      >
        <div className="hp-testimonials-inner">
          <div className="hp-testimonials-header">
            <div className="hp-section-eyebrow">Testimonials</div>
            <h2>Trusted by legal professionals across the globe</h2>
          </div>

          <div className="hp-testimonial-stage">
            {/* Main featured card */}
            <div className="hp-testimonial-main">
              <div className="hp-tm-quote-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                </svg>
              </div>
              <div className="hp-tm-stars">
                {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <blockquote className="hp-tm-review">
                "{testimonials[activeTestimonial].review}"
              </blockquote>
              <div className="hp-tm-profile">
                <img
                  src={testimonials[activeTestimonial].img}
                  alt={testimonials[activeTestimonial].name}
                  className="hp-tm-avatar"
                />
                <div className="hp-tm-info">
                  <span className="hp-tm-name">{testimonials[activeTestimonial].name}</span>
                  <span className="hp-tm-role">{testimonials[activeTestimonial].role}</span>
                  <span className="hp-tm-location">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {testimonials[activeTestimonial].location}
                  </span>
                </div>
              </div>
            </div>

            {/* Side nav cards */}
            <div className="hp-testimonial-sidebar">
              {testimonials.map((t, i) => (
                <div
                  key={t.id}
                  className={`hp-ts-card ${i === activeTestimonial ? "active" : ""}`}
                  onClick={() => setActiveTestimonial(i)}
                >
                  <img src={t.img} alt={t.name} className="hp-ts-avatar" />
                  <div className="hp-ts-info">
                    <span className="hp-ts-name">{t.name}</span>
                    <span className="hp-ts-company">{t.role.split(",")[1]?.trim() || t.role}</span>
                  </div>
                  {i === activeTestimonial && (
                    <div className="hp-ts-active-dot" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="hp-testimonial-nav">
            <button className="hp-tn-btn" onClick={prevTestimonial}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            </button>
            <div className="hp-tn-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`hp-tn-dot ${i === activeTestimonial ? "active" : ""}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
            <button className="hp-tn-btn" onClick={nextTestimonial}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="newsletter">
        <div className="newsletter-content">
          <h2>Stay Ahead of the Curve</h2>
          <p>Join our exclusive list to get the latest in Legal Tech & AI.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn-primarye" onClick={handleSubscribe}>Subscribe</button>
          </div>
          {message && <p className="newsletter-msg">{message}</p>}
        </div>
      </section>

      {/* ── Footer ── */}
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