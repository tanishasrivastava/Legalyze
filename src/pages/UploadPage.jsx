import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners"; // Added Import
import "./UploadPage.css";

function UploadPage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [contractText, setContractText] = useState("");
  const [loading, setLoading] = useState(false); // Added Loading State

  const navigate = useNavigate();

  const email = localStorage.getItem("email") || "user@example.com";
  const name = localStorage.getItem("name") || "User";
  const userInitial = name ? name[0].toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleAnalyze = async () => {
    if (!file && !contractText) {
      alert("Please upload a file or paste contract text to analyze.");
      return;
    }

    setLoading(true); // Start Loading

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (contractText) formData.append("contract_text", contractText);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + (err.error || JSON.stringify(err)));
        setLoading(false); // Stop on error
        return;
      }

      const data = await res.json();
      // data: {session_id, parties, text} 
      
      navigate("/select-party", { 
        state: { 
          session_id: data.session_id, 
          parties: data.parties, 
          filename: file?.name, 
          documentName,
          text: data.text 
        } 
      });
      // Note: We don't set loading(false) here because navigation happens immediately
    } catch (err) {
      console.error(err);
      alert("Failed to submit. See console.");
      setLoading(false); // Stop on catch
    }
  };

  return (
    <div className="upload-container">
      
      {/* --- LOADER OVERLAY (Added) --- */}
      {loading && (
        <div className="loader-overlay">
          <PuffLoader color="#141d6e" loading size={85} speedMultiplier={1} />
          <p className="loader-text">Analysing parties involved in the contract...</p>
        </div>
      )}

      <header className="reviews-header">
        <div className="header-left" style={{ cursor: "pointer" }} onClick={() => navigate("/reviews")}>
          <img src="/favicon.ico" alt="Legalyze Logo" className="logo-icon" />
          <h1 className="logo-text">Legalyze</h1>
        </div>
        <div className="nav-right">
          <button className="upgrade-btn">Upgrade Plan</button>
          <div className="user-icon" onClick={() => setShowDropdown(!showDropdown)}>{userInitial}</div>
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-initial">{userInitial}</div>
                <div className="profile-details"><p className="profile-name">{name}</p><p className="profile-email">{email}</p></div>
              </div>
              <div className="profile-options">
                <button className="profile-option-btn" onClick={() => alert("Settings coming")}> Settings</button>
                <button className="profile-option-btn" onClick={handleLogout}> Log out</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="upload-body">
        <div className="upload-section">
          <h2 className="upload-title">Upload your contract</h2>

          <div
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <input type="file" id="fileInput" hidden accept=".pdf,.docx" onChange={handleFileChange} />
            {file ? (
              <p className="drop-zone-text">File selected: <strong>{file.name}</strong></p>
            ) : (
              <p className="drop-zone-text">Drag & Drop your contract here or <span className="browse-link">Browse File</span></p>
            )}
            <p className="drop-zone-supported">PDF and DOCX files are supported.</p>
          </div>

          <button className="analyze-btn" onClick={handleAnalyze}>Analyze</button>
        </div>

        <div className="separator">
          <span className="separator-line"></span>
          <span className="separator-text">Or</span>
          <span className="separator-line"></span>
        </div>

        <div className="upload-section">
          <h2 className="upload-title">Paste the text from your contract</h2>
          <div className="form-group">
            <label htmlFor="docName">Document Name</label>
            <input type="text" id="docName" value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="e.g., Freelance Agreement" />
          </div>

          <div className="form-group">
            <label htmlFor="contractText">Paste your contract content</label>
            <textarea id="contractText" rows="10" value={contractText} onChange={(e) => setContractText(e.target.value)} placeholder="Start pasting your contract here..." />
          </div>

          <button className="analyze-btn" onClick={handleAnalyze}>Analyze</button>
        </div>
      </main>

      <footer className="reviews-footer"><p>© 2025 Legalyze. All Rights Reserved.</p></footer>
    </div>
  );
}

export default UploadPage;