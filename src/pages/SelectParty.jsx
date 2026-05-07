import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners"; 
import "./SelectParty.css";

export default function SelectParty() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receive data from UploadPage state
  const { session_id, parties = [], filename, documentName, text } = location.state || {};

  const [selected, setSelected] = useState(parties.length > 0 ? parties[0] : "neutral");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get real user info from localStorage
  const email = localStorage.getItem("email"); 
  const name = localStorage.getItem("name") || "User";
  const userInitial = name ? name[0].toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleReview = async () => {
    if (!email) {
      alert("User email not found. Please log in again.");
      return;
    }

    setLoading(true);
    
    // Create FormData and append all required fields for the backend
    const formData = new FormData();
    formData.append("perspective", selected);
    formData.append("email", email); // FIX: Send email to backend
    formData.append("filename", filename || documentName || "Contract.pdf"); // FIX: Send filename

    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze/${session_id}/finalize`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Navigate to results with all necessary data
        navigate("/analysis-result", { 
          state: { 
            session_id, 
            synopsis: data.synopsis, 
            risk_report: data.risk_report, 
            selected,
            parties, 
            full_text: text,
            filename: filename || documentName
          } 
        });
      } else {
        // Log the exact error from FastAPI (likely the 422 detail)
        console.error("Server Error:", data);
        alert("Error: " + (data.error || "Failed to finalize analysis. Check console."));
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert("Failed to connect to the server.");
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
    <div className="page-wrapperr">
      {loading && (
        <div className="loader-overlay">
          <ClimbingBoxLoader color="#151a56" size={25} />
          <p className="loader-text">
            Please wait while your contract is being analyzed... <br />
            Large documents may take up to a minute.
          </p>
        </div>
      )}

      <header className="navbar">
        <div className="nav-left" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
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
        <h2 className="page-title">Final Step...</h2>
        <div className="file-card">
          <div className="file-icon-wrapper">
            <svg width="24" height="24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M13 2H6C5 2 4 3 4 4V20C4 21 5 22 6 22H18C19 22 20 21 20 20V9L13 2Z" />
              <path d="M13 2V9H20" />
            </svg>
          </div>
          <span className="file-name">{displayFileName}</span>
        </div>

        <div className="form-section">
          <p className="question-label">Which party's perspective are you interested in?</p>
          <div className="radio-group">
            {parties.length === 0 ? (
              <label className="radio-label">
                <input type="radio" checked={selected === "neutral"} onChange={() => setSelected("neutral")} /> Neutral Perspective
              </label>
            ) : (
              parties.map((p, idx) => (
                <label key={idx} className="radio-label">
                  <input type="radio" name="party" value={p} checked={selected === p} onChange={() => setSelected(p)} /> {p}
                </label>
              ))
            )}
          </div>
          <button onClick={handleReview} className="review-btn" disabled={loading}>
            {loading ? "Processing..." : "Generate Analysis"}
          </button>
        </div>
      </main>
    </div>
  );
}