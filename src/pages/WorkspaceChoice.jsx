import React from "react";
import { useNavigate } from "react-router-dom";
import "./WorkspaceChoice.css";
import axios from "axios";

const AI_API = import.meta.env.VITE_AI_API;

function WorkspaceChoice() {
  const navigate = useNavigate();

  const handleSelection = async (type) => {
    const email = localStorage.getItem("email");
    try {
     await axios.post(`${AI_API}/api/user/update-workspace`, {
        email: email,
        workspaceType: type,
      });
      localStorage.setItem("workspaceType", type);
      navigate(type === "Business" ? "/dashboard" : "/upload");
    } catch (err) {
      console.error("Selection failed:", err);
      navigate(type === "Business" ? "/dashboard" : "/upload");
    }
  };

  return (
    <div className="workspace-container">
      <div className="workspace-content">
        <header className="workspace-header">
          <h1>How will you use <span className="brand-text">Legalyze</span>?</h1>
          <p>Choose your workspace type. You can always change this later.</p>
        </header>

        <div className="workspace-grid">
          {/* INDIVIDUAL CARD */}
          <div className="workspace-card" onClick={() => handleSelection("Individual")}>
            <div className="w-icon-box bg-blue-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2>Individual</h2>
            <p className="w-description">Perfect for freelancers, solo lawyers, and professionals who need fast AI-powered contract review.</p>
            
            <ul className="w-features-list">
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> Personal dashboard</li>
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></span> Unlimited contract analysis</li>
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span> All AI tools access</li>
            </ul>
            
            <button className="w-link-btn">Get Started →</button>
          </div>

          {/* BUSINESS CARD */}
          <div className="workspace-card business-card" onClick={() => handleSelection("Business")}>
            <div className="popular-tag">Popular</div>
            <div className="w-icon-box bg-blue-main">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
            </div>
            <h2>Business</h2>
            <p className="w-description">For teams and organizations with collaborative contract review and shared workspaces.</p>
            
            <ul className="w-features-list">
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Create teams & invite members</li>
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span> Collaborative viewing & editing</li>
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h10"/></svg></span> Role management & permissions</li>
              <li><span className="w-icon-svg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> Admin controls</li>
            </ul>
            
            <button className="w-link-btn active">Start with Business →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceChoice;