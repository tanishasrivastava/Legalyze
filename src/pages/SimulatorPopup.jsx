import React, { useState, useEffect } from "react";
import "./SimulatorPopup.css";

const AI_API = import.meta.env.VITE_AI_API;

/* ── Icons ── */
const CloseX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const SEV = {
  HIGH:     { bg: "#fff1f2", color: "#b91c1c", dot: "#ef4444" },
  MEDIUM:   { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  LOW:      { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  CRITICAL: { bg: "#fff1f2", color: "#7f1d1d", dot: "#dc2626" },
};

const STEP_COLORS = {
  SAFE:     { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  WARNING:  { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  DANGER:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  CRITICAL: { bg: "#fff1f2", color: "#b91c1c", border: "#fecaca" },
};

const SCENARIO_EMOJI = {
  payment:   "💸",
  early_exit:"📦",
  breach:    "⏰",
  data:      "🔒",
  force:     "🌪️",
  default:   "⚡",
};

function getEmoji(id = "") {
  if (id.includes("payment")) return SCENARIO_EMOJI.payment;
  if (id.includes("exit") || id.includes("leave")) return SCENARIO_EMOJI.early_exit;
  if (id.includes("breach") || id.includes("deliver")) return SCENARIO_EMOJI.breach;
  if (id.includes("data")) return SCENARIO_EMOJI.data;
  if (id.includes("force") || id.includes("majeure")) return SCENARIO_EMOJI.force;
  return SCENARIO_EMOJI.default;
}

function scoreColor(score) {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f59e0b";
  return "#22c55e";
}

/* ── Single Scenario Card ── */
function ScenarioCard({ scenario, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const sev = SEV[scenario.severity?.toUpperCase()] || SEV.MEDIUM;
  const emoji = getEmoji(scenario.id || scenario.title?.toLowerCase() || "");

  return (
    <div className={`sim-card ${open ? "open" : ""}`}>
      {/* Accordion Header */}
      <div className="sim-card-header" onClick={() => setOpen(o => !o)}>
        <div className="sim-card-left">
          <div className="sim-emoji-box">{emoji}</div>
          <div className="sim-card-info">
            <h3 className="sim-card-title">{scenario.title}</h3>
            <div className="sim-card-meta">
              <span className="sim-sev-badge" style={{ background: sev.bg, color: sev.color }}>
                {scenario.severity}
              </span>
              <span className="sim-card-controllable">{scenario.controllability}</span>
            </div>
          </div>
        </div>
        <div className="sim-card-right">
          <div className="sim-risk-score" style={{ color: scoreColor(scenario.risk_score) }}>
            <span className="sim-score-num">{scenario.risk_score}</span>
            <div className="sim-score-bar" style={{ background: scoreColor(scenario.risk_score) }} />
            <span className="sim-score-label">RISK SCORE</span>
          </div>
          <div className="sim-chevron">{open ? <ChevronUp /> : <ChevronDown />}</div>
        </div>
      </div>

      {/* Stats row (always visible when closed) */}
      {!open && (
        <div className="sim-card-stats">
          <div className="sim-stat">
            <span className="sim-stat-label">MAX EXPOSURE</span>
            <span className="sim-stat-val red">{scenario.max_exposure}</span>
          </div>
          <div className="sim-stat-div" />
          <div className="sim-stat">
            <span className="sim-stat-label">CLAUSES</span>
            <span className="sim-stat-val">{scenario.clauses?.length || 0}</span>
          </div>
          <div className="sim-stat-div" />
          <div className="sim-stat">
            <span className="sim-stat-label">STEPS</span>
            <span className="sim-stat-val">{scenario.escalation_timeline?.length || 0}</span>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {open && (
        <div className="sim-card-body">
          {/* Stats row inside expanded */}
          <div className="sim-card-stats expanded">
            <div className="sim-stat">
              <span className="sim-stat-label">MAX EXPOSURE</span>
              <span className="sim-stat-val red">{scenario.max_exposure}</span>
            </div>
            <div className="sim-stat-div" />
            <div className="sim-stat">
              <span className="sim-stat-label">CLAUSES</span>
              <span className="sim-stat-val">{scenario.clauses?.length || 0}</span>
            </div>
            <div className="sim-stat-div" />
            <div className="sim-stat">
              <span className="sim-stat-label">STEPS</span>
              <span className="sim-stat-val">{scenario.escalation_timeline?.length || 0}</span>
            </div>
          </div>

          {/* Affected Clauses */}
          {scenario.clauses?.length > 0 && (
            <div className="sim-section">
              <div className="sim-section-title">AFFECTED CLAUSES</div>
              <div className="sim-clauses-row">
                {scenario.clauses.map((c, i) => (
                  <span key={i} className="sim-clause-pill">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Decision Paths */}
          {scenario.decision_paths?.length > 0 && (
            <div className="sim-section">
              <div className="sim-section-title">DECISION PATHS</div>
              <div className="sim-decisions">
                {scenario.decision_paths.map((dp, i) => (
                  <div key={i} className="sim-decision-item">
                    <div className="sim-decision-q">
                      <div className="sim-decision-num">{i + 1}</div>
                      <span>{dp.question}</span>
                    </div>
                    <div className="sim-decision-branches">
                      <div className="sim-branch yes">
                        <span className="sim-branch-label yes">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Yes
                        </span>
                        <span className="sim-branch-text">{dp.yes_outcome}</span>
                      </div>
                      <div className="sim-branch no">
                        <span className="sim-branch-label no">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          No
                        </span>
                        <span className="sim-branch-text">{dp.no_outcome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Timeline */}
          {scenario.escalation_timeline?.length > 0 && (
            <div className="sim-section">
              <div className="sim-section-title">ESCALATION TIMELINE</div>
              <div className="sim-timeline">
                {scenario.escalation_timeline.map((step, i) => {
                  const cfg = STEP_COLORS[step.severity?.toUpperCase()] || STEP_COLORS.WARNING;
                  const isLast = i === scenario.escalation_timeline.length - 1;
                  return (
                    <div key={i} className="sim-timeline-row">
                      <div className="sim-tl-left">
                        <div className="sim-tl-dot" style={{ background: cfg.color }} />
                        {!isLast && <div className="sim-tl-line" style={{ background: `${cfg.color}40` }} />}
                      </div>
                      <div className="sim-tl-content">
                        <div className="sim-tl-header">
                          <span className="sim-tl-day">{step.day_range}</span>
                          <span className="sim-tl-sev" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {step.severity}
                          </span>
                        </div>
                        <div className="sim-tl-title">{step.title}</div>
                        <div className="sim-tl-desc">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Line + Recommended Action */}
          {(scenario.bottom_line || scenario.recommended_action) && (
            <div className="sim-bottom-row">
              {scenario.bottom_line && (
                <div className="sim-bottom-card warning">
                  <div className="sim-bottom-label">⚡ BOTTOM LINE</div>
                  <p>{scenario.bottom_line}</p>
                </div>
              )}
              {scenario.recommended_action && (
                <div className="sim-bottom-card success">
                  <div className="sim-bottom-label">💡 RECOMMENDED ACTION</div>
                  <p>{scenario.recommended_action}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Popup ── */
export default function SimulatorPopup({ isOpen, onClose, contractText, perspective }) {
  const [loading, setLoading]     = useState(false);
  const [scenarios, setScenarios] = useState(null);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (isOpen && contractText && !scenarios) {
      fetchScenarios();
    }
  }, [isOpen, contractText]);

  const fetchScenarios = async () => {
    setLoading(true);
    setError(null);
    try {
     const res = await fetch(`${AI_API}/scenario-simulator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_text: contractText, perspective: perspective || "The User" }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setScenarios(data);
    } catch (e) {
      setError("Failed to simulate scenarios. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const allScenarios = scenarios?.scenarios || [];
  const criticalCount = allScenarios.filter(s => s.severity?.toUpperCase() === "CRITICAL").length;
  const highCount     = allScenarios.filter(s => s.severity?.toUpperCase() === "HIGH").length;

  return (
    <div className="sim-overlay" onClick={onClose}>
      <div className="sim-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sim-header">
          <div className="sim-header-left">
            <div className="sim-header-icon"><ZapIcon /></div>
            <div>
              <h2 className="sim-header-title">What-If Scenario Simulator</h2>
              <p className="sim-header-sub">Risk Simulation</p>
            </div>
          </div>
          <button className="sim-close-btn" onClick={onClose}><CloseX /></button>
        </div>

        {/* Body */}
        <div className="sim-body">
          {loading && (
            <div className="sim-loading">
              <div className="sim-loader-track">
                <div className="sim-loader-fill" />
              </div>
              <p className="sim-loading-text">Simulating contract scenarios...</p>
              <span className="sim-loading-sub">Analyzing decision trees and financial impact. This may take upto a minute, based on the length of your contract.</span>
            </div>
          )}

          {error && (
            <div className="sim-error">
              <p>{error}</p>
              <button className="sim-retry" onClick={fetchScenarios}>Retry</button>
            </div>
          )}

          {!loading && !error && scenarios && (
            <>
              {/* Intro */}
              <p className="sim-intro">
                Select a scenario below to simulate how your contract responds — step by step, with financial impact at every stage.
              </p>

              {/* Summary badges */}
              <div className="sim-summary-badges">
                <span className="sim-sbadge total">{allScenarios.length} SCENARIOS</span>
                {criticalCount > 0 && <span className="sim-sbadge critical">{criticalCount} CRITICAL</span>}
                {highCount > 0 && <span className="sim-sbadge high">{highCount} HIGH RISK</span>}
              </div>

              {/* Scenario cards */}
              <div className="sim-scenarios">
                {allScenarios.map((sc, i) => (
                  <ScenarioCard key={i} scenario={sc} defaultOpen={i === 0} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}