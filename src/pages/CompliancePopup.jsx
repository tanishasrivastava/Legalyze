import React, { useState, useEffect } from "react";
import "./CompliancePopup.css";

const AI_API = import.meta.env.VITE_AI_API;

/* ─── Icons ─── */
const CloseX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const WarnIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

/* ─── Animated progress bar ─── */
function FrameworkBar({ value, color, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 200);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="cp-fw-track">
      <div className="cp-fw-fill" style={{ width: `${width}%`, background: color, transition: "width 1s cubic-bezier(.4,0,.2,1)" }}/>
    </div>
  );
}

/* ─── Status config ─── */
const STATUS_CFG = {
  Compliant:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", barColor: "#22c55e" },
  Partial:        { bg: "#fffbeb", color: "#d97706", border: "#fde68a", barColor: "#f59e0b" },
  "Non-Compliant":{ bg: "#fff1f2", color: "#dc2626", border: "#fecaca", barColor: "#ef4444" },
};

const RULE_CFG = {
  pass:    { iconBg: "#f0fdf4", iconBorder: "#bbf7d0", rowBg: "#fff",    icon: <CheckIcon/> },
  fail:    { iconBg: "#fff1f2", iconBorder: "#fecaca", rowBg: "#fff1f2", icon: <XIcon/>    },
  warning: { iconBg: "#fffbeb", iconBorder: "#fde68a", rowBg: "#fffbeb", icon: <WarnIcon/> },
};

function RuleRow({ rule }) {
  const cfg = RULE_CFG[rule.status] || RULE_CFG.warning;
  return (
    <div className="cp-rule-row" style={{ background: cfg.rowBg }}>
      <div className="cp-rule-icon" style={{ background: cfg.iconBg, border: `1.5px solid ${cfg.iconBorder}` }}>
        {cfg.icon}
      </div>
      <div className="cp-rule-text">
        <div className="cp-rule-title">{rule.title}</div>
        <div className="cp-rule-desc">{rule.description}</div>
      </div>
    </div>
  );
}

function FrameworkSection({ fw, index }) {
  const cfg = STATUS_CFG[fw.status] || STATUS_CFG.Partial;
  const isCompliant = fw.status === "Compliant";
  return (
    <div className="cp-fw-section">
      <div className="cp-fw-header">
        <span className="cp-fw-name">{fw.name}</span>
        <FrameworkBar value={fw.score} color={cfg.barColor} delay={index * 150}/>
        <span className="cp-fw-pct" style={{ color: cfg.barColor }}>{fw.score}%</span>
        <span className="cp-fw-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          {isCompliant && <CheckIcon/>} {fw.status}
        </span>
      </div>
      <div className="cp-rules-list">
        {(fw.rules || []).map((rule, i) => <RuleRow key={i} rule={rule}/>)}
      </div>
    </div>
  );
}

/* ─── Main Popup ─── */
export default function CompliancePopup({ isOpen, onClose, contractText, perspective }) {
  const [loading,    setLoading]    = useState(false);
  const [data,       setData]       = useState(null);
  const [error,      setError]      = useState(null);
  const [hasRun,     setHasRun]     = useState(false);

  useEffect(() => {
    if (isOpen && contractText && !hasRun) {
      runAudit();
    }
  }, [isOpen, contractText]);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
       const res = await fetch(`${AI_API}/api/compliance-check`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ contract_text: contractText, perspective: perspective || "The User" }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(json);
      setHasRun(true);
    } catch (e) {
      setError(e.message || "Audit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const frameworks = data?.frameworks || [];
  const overallScore = frameworks.length
    ? Math.round(frameworks.reduce((s, f) => s + f.score, 0) / frameworks.length)
    : 0;

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-header-icon"><ClipboardIcon/></div>
            <div>
              <h2 className="cp-header-title">AI Compliance Checker</h2>
              <p className="cp-header-sub">Regulatory Compliance</p>
            </div>
          </div>
          <button className="cp-close-btn" onClick={onClose}><CloseX/></button>
        </div>

        {/* Body */}
        <div className="cp-body">
          {loading && (
            <div className="cp-loading">
              <div className="cp-loader-track"><div className="cp-loader-fill"/></div>
              <p className="cp-loading-text">Checking against regulatory frameworks...</p>
              <span className="cp-loading-sub">GDPR · Labor Law · Financial Regulation · IP Law</span>
            </div>
          )}

          {error && (
            <div className="cp-error">
              <p>{error}</p>
              <button className="cp-retry" onClick={runAudit}>Retry</button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <p className="cp-intro">
                Your contract has been checked against major regulatory frameworks. Review compliance gaps below.
              </p>
              <div className="cp-frameworks">
                {frameworks.map((fw, i) => <FrameworkSection key={i} fw={fw} index={i}/>)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}