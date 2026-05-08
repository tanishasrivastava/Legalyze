import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TimelinePopup from "./TimelinePopup";
import VoicePopup from "./VoicePopup";
import AmbiguityPopup from "./AmbiguityPopup";
import NegotiationPopup from "./NegotiationPopup";
import CertificatePopup from "./CertificatePopup";
import ExecutivePopup from "./ExecutivePopup";
import FinancialPopup from "./FinancialPopup";
import SimulatorPopup    from "./SimulatorPopup"; 
import EscapeRoutePopup from "./EscapeRoutePopup";
import CompliancePopup from "./CompliancePopup";
import "./AdvancedTools.css";

const AI_API = import.meta.env.VITE_AI_API;
/* ---------------- ICONS ---------------- */
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ArrowRightSmall = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14m-7-7 7 7-7 7"/>
  </svg>
);

const CloseX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const AlertTriIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ---------------- NEW ICONS FOR NEW TOOLS ---------------- */
const FileCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>
  </svg>
);

const ExecutiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

/* ---------------- UPDATED TOOL CONFIG ---------------- */
const tools = [
  { id: "timeline", title: "AI Legal Timeline Generator", description: "Extract all deadlines, obligations, and key dates from your contract. Visualize them in a chronological timeline.", tag: "Deadlines & Obligations", iconClass: "timeline", icon: <CalendarIcon /> },
  { id: "voice", title: "AI Voice Legal Assistant", description: "Ask questions about your contract using natural language. Get instant, context-aware answers powered by AI.", tag: "Voice Interaction", iconClass: "voice", icon: <MicIcon /> },
  { id: "ambiguity", title: "AI Ambiguity Detector", description: "Detect vague and legally ambiguous language in your contract. Get precise rewrites.", tag: "Legal Intelligence", iconClass: "ambiguity", icon: <AlertTriIcon /> },
  { id: "negotiation", title: "AI Contract Negotiation Coach", description: "Get strategic advice on which clauses to negotiate before signing. Receive ready-to-use negotiation scripts.", tag: "Pre-Signing Strategy", iconClass: "negotiation", icon: <UsersIcon /> },
  { id: "certificate", title: "Pre-Signing Risk Certificate", description: "Generate a professional safety certificate with risk score, compliance rating, and recommendation.", tag: "Compliance Report", iconClass: "certificate", icon: <ShieldIcon /> },
  { id: "compliance", title: "AI Compliance Checker", description: "Verify your contract against GDPR, labor laws, industry standards, and regulatory frameworks.", tag: "Regulatory Compliance", iconClass: "compliance", icon: <FileCheckIcon /> },
  { id: "executive", title: "Executive Summary Generator", description: "Generate a one-page executive briefing for stakeholders. Includes key obligations and decision points.", tag: "Stakeholder Report", iconClass: "executive", icon: <ExecutiveIcon /> },
  { id: "financial", title: "AI Financial Exposure Calculator", description: "Calculate total financial exposure including penalties, late fees, and worst-case liability.", tag: "Cost Analysis", iconClass: "financial", icon: <DollarIcon /> },
  { id: "escape", title: "AI Escape Route Mapper", description: "Map every exit strategy in your contract — termination rights, force majeure, and cooling-off periods.", tag: "Exit Strategy", iconClass: "escape", icon: <LogoutIcon /> },
  { id: "simulator", title: "What-If Scenario Simulator", description: "Simulate real-world scenarios — late payments, early exit, or breach — and see exactly what will happen.", tag: "Risk Simulation", iconClass: "simulator", icon: <ZapIcon /> },
];

export default function AdvancedTools() {
  const navigate = useNavigate();
  const location = useLocation();

  const saved = localStorage.getItem("analysisData");
  const stateData = location.state ? location.state : saved ? JSON.parse(saved) : null;
  const sessionId = stateData?.session_id;
  const contractText = stateData?.full_text;
  const perspective = stateData?.perspective || "The User";
  console.log("STATE DATA:", stateData);
console.log("SESSION ID:", sessionId);
console.log("CONTRACT TEXT:", contractText);

  useEffect(() => {
    if (location.state) {
      localStorage.setItem("analysisData", JSON.stringify(location.state));
    }
  }, [location.state]);

  const [activeTool, setActiveTool] = useState(null);
  const activeToolData = useMemo(() => tools.find(t => t.id === activeTool), [activeTool]);

const handleBack = () => {
  const latestData = location.state
    ? location.state
    : JSON.parse(localStorage.getItem("analysisData"));

  navigate("/analysis-result", { state: latestData });
};
  return (
    <div className="adv-wrapper">
      <nav className="adv-nav">
        <div className="adv-brand">
          <img src="/legal3.png" alt="Logo" className="adv-logo-img" />
          Legalyze <span className="adv-brand-sep">/ Advanced Tools</span>
        </div>
        <button className="adv-back-btn" onClick={handleBack}>
          <ArrowLeftIcon /> Back to Analysis
        </button>
      </nav>

      <section className="adv-hero">
        <div className="adv-hero-inner">
          <h1 className="adv-hero-title">Contract <span className="text-gradient">Intelligence Suite</span></h1>
          <p className="adv-hero-subtitle">Go beyond basic analysis. Leverage AI-powered tools to extract insights and mitigate risks.</p>
        </div>
      </section>

      <main className="adv-container">
        <div className="adv-grid">
          {tools.map((tool, idx) => (
            <div 
              key={tool.id} 
              className={`adv-card ${tool.iconClass} ${activeTool === tool.id ? 'active' : ''}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => setActiveTool(tool.id)}
            >
              <div className="adv-card-accent"></div>
              <div className={`adv-card-icon-box ${tool.iconClass}`}>
                {tool.icon}
              </div>
              <h3 className="adv-card-title">{tool.title}</h3>
              <p className="adv-card-desc">{tool.description}</p>
              <div className="adv-card-footer">
                <span className="adv-card-tag">{tool.tag}</span>
                <div className="adv-card-arrow">
                  <ArrowRightSmall />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- POPUPS --- */}
      <TimelinePopup 
        isOpen={activeTool === "timeline"} 
        onClose={() => setActiveTool(null)} 
        sessionId={sessionId}
        contractText={contractText}
      />
      
      <VoicePopup 
        isOpen={activeTool === "voice"} 
        onClose={() => setActiveTool(null)} 
        contractText={contractText} 
      />

      <AmbiguityPopup 
        isOpen={activeTool === "ambiguity"} 
        onClose={() => setActiveTool(null)} 
        contractText={contractText}
      />

      <NegotiationPopup 
        isOpen={activeTool === "negotiation"} 
        onClose={() => setActiveTool(null)} 
        contractText={contractText}
        perspective={perspective}
      />

      <CertificatePopup
      isOpen={activeTool === "certificate"}
      onClose={() => setActiveTool(null)}
      contractText={contractText}
      perspective={perspective}
      />

      <ExecutivePopup 
        isOpen={activeTool === "executive"}
        onClose={() => setActiveTool(null)}
        contractText={contractText}
        perspective={perspective}
      />

      <FinancialPopup 
        isOpen={activeTool === "financial"}
        onClose={() => setActiveTool(null)}
        contractText={contractText}
        perspective={perspective}
      />

        <EscapeRoutePopup
          isOpen={activeTool === "escape"}
          onClose={() => setActiveTool(null)}
          contractText={contractText}
          perspective={perspective}
        />

        <SimulatorPopup
        isOpen={activeTool === "simulator"}
        onClose={() => setActiveTool(null)}
        contractText={contractText}
        perspective={perspective}
      />
      <CompliancePopup 
  isOpen={activeTool === "compliance"} 
  onClose={() => setActiveTool(null)} 
  contractText={contractText} 
/>

      {/* Logic: Generic Side Panel for the NEW tools */}
      {activeTool && !["timeline", "voice", "ambiguity", "negotiation", "certificate", "compliance", "executive", "financial", "escape", "simulator"].includes(activeTool) && (
        <div className="adv-overlay" onClick={() => setActiveTool(null)}>
          <div className="adv-side-panel" onClick={e => e.stopPropagation()}>
            <div className="adv-panel-header">
              <div className="adv-panel-title-area">
                <div className={`adv-panel-icon ${activeToolData?.iconClass}`}>
                    {activeToolData?.icon}
                </div>
                <div>
                    <h2>{activeToolData?.title}</h2>
                    <span className="adv-panel-tag">{activeToolData?.tag}</span>
                </div>
              </div>
              <button className="adv-panel-close" onClick={() => setActiveTool(null)}>
                <CloseX />
              </button>
            </div>
            
            <div className="adv-panel-content">
              <div className="adv-tool-loading">
                <div className="loader-ring"></div>
                <p>Performing {activeToolData?.title}...</p>
                <small>Scanning contract for relevant clauses.</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}