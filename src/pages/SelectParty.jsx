import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners"; // Added Import
import "./SelectParty.css";

export default function SelectParty() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive text from UploadPage
  const { session_id, parties = [], filename, documentName, text } = location.state || {};

  const [selected, setSelected] = useState(parties.length > 0 ? parties[0] : "neutral");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const email = localStorage.getItem("email") || "user@example.com";
  const name = localStorage.getItem("name") || "User";
  const userInitial = name ? name[0].toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleReview = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("perspective", selected);

    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze/${session_id}/finalize`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // UPDATE: Pass the text (either from previous state or backend) to AnalysisResult
        navigate("/analysis-result", { 
          state: { 
            session_id, 
            synopsis: data.synopsis, 
            risk_report: data.risk_report, 
            selected,
            parties, 
            full_text: data.full_text || text // Ensure we pass the text
          } 
        });
      } else {
        alert("Error: " + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const close = (e) => { if (!e.target.closest(".profile-wrapper")) setDropdownOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const displayFileName = filename || documentName || "Contract File";

  return (
    <div className="page-wrapper">
      
      {/* --- LOADER OVERLAY (Added) --- */}
      {loading && (
        <div className="loader-overlay">
          <ClimbingBoxLoader color="#151a56" size={25} />
          <p className="loader-text">
            Please wait until your contract is being analysed. <br />
            The time taken to analyse your contract depends on your contract size.
          </p>
        </div>
      )}

      <header className="navbar">
        <div className="nav-left" onClick={() => navigate("/reviews")} style={{ cursor: "pointer" }}>
          <img src="/favicon.ico" alt="Logo" className="logo-icon" />
          <h1 className="logo-text">Legalyze</h1>
        </div>
        <div className="nav-right">
          <button className="btn-upgrade">Upgrade Plan</button>
          <div className="profile-wrapper">
            <div className="user-icon" onClick={() => setDropdownOpen(!dropdownOpen)}>{userInitial}</div>
            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-initial">{userInitial}</div>
                  <div className="profile-details">
                    <p className="profile-name">{name}</p>
                    <p className="profile-email">{email}</p>
                  </div>
                </div>
                <div className="profile-options">
                  <button className="profile-option-btn">Settings</button>
                  <button className="profile-option-btn logout" onClick={handleLogout}>Log out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-container">
        <h2 className="page-title">We need a bit more information...</h2>
        <div className="file-card">
          <div className="file-icon-wrapper">
            <svg width="24" height="24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M13 2H6C5 2 4 3 4 4V20C4 21 5 22 6 22H18C19 22 20 21 20 20V9L13 2Z" /><path d="M13 2V9H20" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
          </div>
          <span className="file-name">{displayFileName}</span>
        </div>

        <div className="form-section">
          <p className="question-label">Which Party's Perspective Should We Review The Contract From?</p>
          <div className="radio-group">
            {parties.length === 0 && (
              <label className="radio-label">
                <input type="radio" checked={selected === "neutral"} onChange={() => setSelected("neutral")} /> Neutral
              </label>
            )}
            {parties.map((p, idx) => (
              <label key={idx} className="radio-label">
                <input type="radio" name="party" value={p} checked={selected === p} onChange={() => setSelected(p)} /> {p}
              </label>
            ))}
          </div>
          <p className="helper-text">This helps us give a more accurate, personalized analysis.</p>
          <button onClick={handleReview} className="review-btn" disabled={loading}>
            {loading ? "Analyzing..." : "Review"}
          </button>
        </div>
      </main>
    </div>
  );
}