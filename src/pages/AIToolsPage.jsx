import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import CompliancePopup from "./CompliancePopup";

// Import all existing popups unchanged
import TimelinePopup from "./TimelinePopup";
import VoicePopup from "./VoicePopup";
import AmbiguityPopup from "./AmbiguityPopup";
import NegotiationPopup from "./NegotiationPopup";
import CertificatePopup from "./CertificatePopup";
import ExecutivePopup from "./ExecutivePopup";
import FinancialPopup from "./FinancialPopup";
import EscapeRoutePopup from "./EscapeRoutePopup";
import SimulatorPopup from "./SimulatorPopup";

import "./AIToolsPage.css";


const AI_API = import.meta.env.VITE_AI_API;
// ─── Tool definitions (same 10 as AdvancedTools) ───────────────────────────
const TOOLS = [
  {
    id: "timeline",
    title: "AI Legal Timeline Generator",
    description: "Extract deadlines, obligations, and key dates from your contract.",
    tag: "Deadlines",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: "voice",
    title: "AI Voice Legal Assistant",
    description: "Ask questions about your contract using natural language.",
    tag: "Voice",
    color: "#ef4444",
    bgColor: "#fff1f2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
  },
  {
    id: "ambiguity",
    title: "AI Ambiguity Detector",
    description: "Detect vague and legally ambiguous language in your contract.",
    tag: "Intelligence",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    id: "negotiation",
    title: "AI Contract Negotiation Coach",
    description: "Get strategic advice on clauses to negotiate before signing.",
    tag: "Strategy",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "certificate",
    title: "Pre-Signing Risk Certificate",
    description: "Generate a professional risk and compliance certificate.",
    tag: "Compliance",
    color: "#10b981",
    bgColor: "#f0fdf4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: "compliance",
    title: "AI Compliance Checker",
    description: "Verify against GDPR, labor laws, and industry standards.",
    tag: "Regulatory",
    color: "#06b6d4",
    bgColor: "#ecfeff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    id: "executive",
    title: "Executive Summary Generator",
    description: "Generate a one-page executive briefing for stakeholders.",
    tag: "Report",
    color: "#64748b",
    bgColor: "#f8fafc",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    id: "financial",
    title: "AI Financial Exposure Calculator",
    description: "Calculate total financial exposure including penalties and liability.",
    tag: "Finance",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: "escape",
    title: "AI Escape Route Mapper",
    description: "Map every exit strategy in your contract.",
    tag: "Exit",
    color: "#6366f1",
    bgColor: "#eef2ff",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  },
  {
    id: "simulator",
    title: "What-If Scenario Simulator",
    description: "Simulate real-world scenarios — late payments, breach, early exit.",
    tag: "Simulation",
    color: "#ec4899",
    bgColor: "#fdf2f8",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
];

// ─── Upload Modal ──────────────────────────────────────────────────────────
function UploadModal({ tool, onClose, onReady }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [pasting, setPasting] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    processFile(f);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!file && !pasteText.trim()) {
      setError("Please upload a PDF or paste contract text.");
      return;
    }
    setUploading(true);
    setError("");

    try {
      let contractText = "";

      if (pasteText.trim()) {
        contractText = pasteText.trim();
      } else {
        // Upload PDF and extract text
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${AI_API}/analyze`, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        contractText = data.text || "";
      }

      if (!contractText) throw new Error("Could not extract text from contract.");
      onReady(contractText);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="atp-upload-overlay" onClick={onClose}>
      <div className="atp-upload-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="atp-um-header">
          <div className="atp-um-icon" style={{ background: tool.bgColor, color: tool.color }}>
            {tool.icon}
          </div>
          <div className="atp-um-titles">
            <h3>{tool.title}</h3>
            <span className="atp-um-tag" style={{ background: tool.bgColor, color: tool.color }}>
              {tool.tag}
            </span>
          </div>
          <button className="atp-um-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="atp-um-body">
          {!pasting ? (
            <>
              {/* Drop zone */}
              <div
                className={`atp-dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {file ? (
                  <div className="atp-file-selected">
                    <div className="atp-file-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="atp-file-info">
                      <span className="atp-file-name">{file.name}</span>
                      <span className="atp-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button className="atp-file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="atp-dropzone-inner">
                    <div className="atp-drop-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="atp-drop-text">Drop your contract PDF here</p>
                    <p className="atp-drop-sub">or <span className="atp-drop-link">click to browse</span></p>
                  </div>
                )}
              </div>

              <div className="atp-divider">
                <span>or</span>
              </div>

              <button className="atp-paste-btn" onClick={() => setPasting(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Paste contract text instead
              </button>
            </>
          ) : (
            <>
              <div className="atp-paste-area-wrap">
                <textarea
                  className="atp-paste-textarea"
                  placeholder="Paste your contract text here..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={10}
                />
              </div>
              <button className="atp-back-btn" onClick={() => setPasting(false)}>
                ← Upload PDF instead
              </button>
            </>
          )}

          {error && <p className="atp-error-msg">{error}</p>}

          <button
            className="atp-run-btn"
            onClick={handleSubmit}
            disabled={uploading || (!file && !pasteText.trim())}
            style={{ "--tool-color": tool.color }}
          >
            {uploading ? (
              <>
                <span className="atp-btn-spinner" /> Extracting contract...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Run {tool.title}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AIToolsPage() {
  const navigate = useNavigate();
  const [pendingTool, setPendingTool] = useState(null);   // tool awaiting upload
  const [activeTool, setActiveTool] = useState(null);     // tool popup open
  const [contractText, setContractText] = useState(null); // extracted text

  const handleToolClick = (tool) => {
    // Reset contract text for a fresh run
    setContractText(null);
    setPendingTool(tool);
  };

  const handleUploadReady = (text) => {
    setContractText(text);
    setActiveTool(pendingTool);
    setPendingTool(null);
  };

  const handleCloseUpload = () => setPendingTool(null);
  const handleCloseTool = () => { setActiveTool(null); setContractText(null); };

  return (
    <DashboardLayout>
      <div className="atp-page">
        {/* Page Header */}
        <div className="atp-page-header">
          <h1 className="atp-page-title">AI Tools</h1>
          <p className="atp-page-sub">
            Use individual AI tools on any contract — no full analysis required.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="atp-grid">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="atp-tool-card"
              onClick={() => handleToolClick(tool)}
              style={{ "--card-accent": tool.color }}
            >
              <div
                className="atp-card-icon"
                style={{ background: tool.bgColor, color: tool.color }}
              >
                {tool.icon}
              </div>
              <h3 className="atp-card-title">{tool.title}</h3>
              <p className="atp-card-desc">{tool.description}</p>
              <div className="atp-card-footer">
                <span className="atp-card-tag" style={{ background: tool.bgColor, color: tool.color }}>
                  {tool.tag}
                </span>
                <div className="atp-card-arrow" style={{ color: tool.color }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal — shown before popup */}
      {pendingTool && (
        <UploadModal
          tool={pendingTool}
          onClose={handleCloseUpload}
          onReady={handleUploadReady}
        />
      )}

      {/* ── All 10 Popups (reusing existing components unchanged) ── */}
      <TimelinePopup
        isOpen={activeTool?.id === "timeline"}
        onClose={handleCloseTool}
        contractText={contractText}
      />
      <VoicePopup
        isOpen={activeTool?.id === "voice"}
        onClose={handleCloseTool}
        contractText={contractText}
      />
      <AmbiguityPopup
        isOpen={activeTool?.id === "ambiguity"}
        onClose={handleCloseTool}
        contractText={contractText}
      />
      <NegotiationPopup
        isOpen={activeTool?.id === "negotiation"}
        onClose={handleCloseTool}
        contractText={contractText}
        perspective="The User"
      />
      <CertificatePopup
        isOpen={activeTool?.id === "certificate"}
        onClose={handleCloseTool}
        contractText={contractText}
        perspective="The User"
      />

      <CompliancePopup
  isOpen={activeTool?.id === "compliance"}
  onClose={handleCloseTool}
  contractText={contractText}
  perspective="The User"
/>
<SimulatorPopup
  isOpen={activeTool?.id === "simulator"}
  onClose={handleCloseTool}
  contractText={contractText}
  perspective="The User"
/>
      <ExecutivePopup
        isOpen={activeTool?.id === "executive"}
        onClose={handleCloseTool}
        contractText={contractText}
        perspective="The User"
      />
      <FinancialPopup
        isOpen={activeTool?.id === "financial"}
        onClose={handleCloseTool}
        contractText={contractText}
        perspective="The User"
      />
      <EscapeRoutePopup
        isOpen={activeTool?.id === "escape"}
        onClose={handleCloseTool}
        contractText={contractText}
        perspective="The User"
      />
    </DashboardLayout>
  );
}

// ─── Generic placeholder for tools without a dedicated popup yet ──────────
function GenericToolModal({ tool, onClose }) {
  return (
    <div className="atp-generic-overlay" onClick={onClose}>
      <div className="atp-generic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="atp-gm-header">
          <div className="atp-gm-icon" style={{ background: tool.bgColor, color: tool.color }}>
            {tool.icon}
          </div>
          <div>
            <h3>{tool.title}</h3>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{tool.tag}</span>
          </div>
          <button className="atp-um-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="atp-gm-body">
          <div className="atp-gm-coming">
            <div className="atp-gm-badge">Coming Soon</div>
            <p>This tool is currently being built. Check back soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}