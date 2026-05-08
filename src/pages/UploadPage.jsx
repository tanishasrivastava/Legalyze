import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PuffLoader } from "react-spinners"; 
import { Upload, FileText, ChevronRight } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import "./UploadPage.css";

const AI_API = import.meta.env.VITE_AI_API;

function UploadPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [contractText, setContractText] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragEnter = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); };
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleAnalyze = async () => {
    if (!file && !contractText) {
      alert("Please upload a file or paste contract text.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (contractText) formData.append("contract_text", contractText);

    try {
    const res = await fetch(`${AI_API}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + (err.error || "Analysis failed"));
        setLoading(false);
        return;
      }

      const data = await res.json();
      navigate("/select-party", { 
        state: { 
          session_id: data.session_id, 
          parties: data.parties, 
          filename: file?.name, 
          documentName,
          text: data.text 
        } 
      });
    } catch (err) {
      console.error(err);
      alert("Connection to server failed.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="upload-page-wrapper">
        {/* LOADER OVERLAY */}
        {loading && (
          <div className="analysis-loader-overlay">
            <PuffLoader color="#4f46e5" size={80} />
            <p>Identifying parties and clauses...</p>
          </div>
        )}

        <header className="upload-header-content">
          <h1>New Analysis</h1>
          <p>Upload a legal document to begin AI-powered risk assessment.</p>
        </header>

        <div className="upload-grid">
          {/* LEFT: FILE UPLOAD */}
          <div className="upload-card">
            <div className="card-header">
              <Upload size={20} color="#4f46e5" />
              <h3>Upload Document</h3>
            </div>
            
            <div
              className={`upload-dropzone ${isDragging ? "active" : ""} ${file ? "has-file" : ""}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input type="file" id="fileInput" hidden accept=".pdf,.docx" onChange={handleFileChange} />
              <div className="dropzone-content">
                <div className="icon-circle">
                  <FileText size={32} />
                </div>
                {file ? (
                  <div className="file-info">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <p className="main-text">Click to browse or drag & drop</p>
                    <p className="sub-text">PDF or DOCX (Max 25MB)</p>
                  </>
                )}
              </div>
            </div>
            <button className="primary-analyze-btn" onClick={handleAnalyze} disabled={!file || loading}>
              Analyze File <ChevronRight size={16} />
            </button>
          </div>

          <div className="upload-divider">
            <span className="line"></span>
            <span className="text">OR</span>
            <span className="line"></span>
          </div>

          {/* RIGHT: TEXT PASTE */}
          <div className="upload-card">
            <div className="card-header">
              <FileText size={20} color="#4f46e5" />
              <h3>Paste Text</h3>
            </div>
            
            <div className="paste-form">
              <div className="input-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  value={documentName} 
                  onChange={(e) => setDocumentName(e.target.value)} 
                  placeholder="e.g. Service Agreement" 
                />
              </div>

              <div className="input-group">
                <label>Contract Content</label>
                <textarea 
                  value={contractText} 
                  onChange={(e) => setContractText(e.target.value)} 
                  placeholder="Paste the legal text here..."
                  rows="8"
                />
              </div>
            </div>
            <button className="primary-analyze-btn secondary" onClick={handleAnalyze} disabled={!contractText || loading}>
              Analyze Text <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UploadPage;