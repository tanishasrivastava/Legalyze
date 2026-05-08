import React, { useState, useEffect, useRef } from "react";
import "./EscapeRoutePopup.css";

const AI_API = import.meta.env.VITE_AI_API;
/* ---- Icons ---- */
const CloseX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const AlertTriIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const DollarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ---- Status badge config ---- */
const STATUS_CONFIG = {
  OPEN: { color: "#22c55e", label: "OPEN", dot: "#22c55e" },
  RESTRICTED: { color: "#f59e0b", label: "RESTRICTED", dot: "#f59e0b" },
  CLOSED: { color: "#ef4444", label: "CLOSED", dot: "#ef4444" },
};

const CAR_EMOJI = ["🚗", "🚙"];

export default function EscapeRoutePopup({ isOpen, onClose, contractText, perspective }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [detailExit, setDetailExit] = useState(null);
  const [carPos, setCarPos] = useState(0);
  const [visibleExits, setVisibleExits] = useState([]);
  const roadRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (isOpen && contractText && !data) {
      fetchEscapeRoutes();
    }
  }, [isOpen, contractText]);

  useEffect(() => {
    if (data?.exits) {
      setVisibleExits([]);
      data.exits.forEach((_, i) => {
        setTimeout(() => {
          setVisibleExits(prev => [...prev, i]);
        }, 300 + i * 180);
      });
      // animate car
      let pos = 0;
      const target = 75;
      animRef.current = setInterval(() => {
        pos += 0.4;
        setCarPos(pos);
        if (pos >= target) clearInterval(animRef.current);
      }, 16);
    }
    return () => clearInterval(animRef.current);
  }, [data]);

  const fetchEscapeRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
   const res = await fetch(`${AI_API}/escape-routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_text: contractText, perspective: perspective || "The User" }),
      });
      if (!res.ok) throw new Error("Server error");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError("Failed to analyze escape routes. Please try again.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const exits = data?.exits || [];
  const summary = data?.summary || {};

  const openCount = exits.filter(e => e.status === "OPEN").length;
  const restrictedCount = exits.filter(e => e.status === "RESTRICTED").length;
  const closedCount = exits.filter(e => e.status === "CLOSED").length;
  const flexibility = data?.flexibility || "UNKNOWN";

  const flexColor = flexibility === "HIGH" ? "#22c55e" : flexibility === "MODERATE" ? "#60a5fa" : flexibility === "LOW" ? "#ef4444" : "#94a3b8";

  return (
    <div className="erp-overlay" onClick={onClose}>
      <div className="erp-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="erp-header">
          <div className="erp-header-left">
            <div className="erp-header-icon">
              <LogoutIcon />
            </div>
            <div>
              <h2 className="erp-header-title">AI Escape Route Mapper</h2>
              <p className="erp-header-sub">Exit Strategy</p>
            </div>
          </div>
          <button className="erp-close-btn" onClick={onClose}><CloseX /></button>
        </div>

        {/* Body */}
        <div className="erp-body">
          {loading && (
            <div className="erp-loading">
              <div className="erp-loader-highway">
                <div className="erp-loader-road">
                  <div className="erp-loader-car">🚗</div>
                  <div className="erp-loader-dashes"></div>
                </div>
              </div>
              <p className="erp-loading-text">Mapping your contract exit routes...</p>
              <span className="erp-loading-sub">Analyzing termination rights & escape clauses</span>
            </div>
          )}

          {error && (
            <div className="erp-error">
              <AlertTriIcon />
              <p>{error}</p>
              <button className="erp-retry-btn" onClick={fetchEscapeRoutes}>Retry</button>
            </div>
          )}

          {!loading && !error && data && (
            <div className="erp-content">
              {/* Highway Map Card */}
              <div className="erp-highway-card">
                <div className="erp-highway-header">
                  <div className="erp-highway-title-row">
                    <span className="erp-highway-emoji">🛣️</span>
                    <div>
                      <h3 className="erp-highway-title">Contract Exit Highway</h3>
                      <p className="erp-highway-sub">Navigate your termination routes</p>
                    </div>
                  </div>
                  <div className="erp-legend">
                    <span className="erp-legend-item open">🟢 Open Route</span>
                    <span className="erp-legend-item restricted">🟡 Restricted</span>
                    <span className="erp-legend-item closed">🔴 Closed</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="erp-badges">
                  {openCount > 0 && <span className="erp-badge open">{openCount} Open Exit{openCount > 1 ? "s" : ""}</span>}
                  {restrictedCount > 0 && <span className="erp-badge restricted">{restrictedCount} Restricted</span>}
                  {closedCount > 0 && <span className="erp-badge closed">{closedCount} Closed</span>}
                  <span className="erp-badge flex" style={{ color: flexColor, borderColor: flexColor }}>Flexibility: {flexibility}</span>
                </div>

                {/* Highway Road */}
                <div className="erp-highway" ref={roadRef}>
                  <div className="erp-road-bg">
                    <div className="erp-road">
                      <div className="erp-road-line" />
                      {/* Animated cars */}
                      <div className="erp-car erp-car-1" style={{ top: `${carPos * 0.6}%` }}>🚗</div>
                      <div className="erp-car erp-car-2" style={{ top: `${Math.min(carPos * 0.9, 85)}%` }}>🚙</div>
                    </div>

                    {/* Exit cards on alternating sides */}
                    {exits.map((exit, idx) => {
                      const isLeft = idx % 2 !== 0;
                      const statusCfg = STATUS_CONFIG[exit.status] || STATUS_CONFIG.OPEN;
                      const isVisible = visibleExits.includes(idx);
                      const isExpanded = expandedId === exit.id;
                      const topPct = 10 + (idx / Math.max(exits.length - 1, 1)) * 78;

                      return (
                        <div
                          key={exit.id}
                          className={`erp-exit-wrapper ${isLeft ? "left" : "right"} ${isVisible ? "visible" : ""}`}
                          style={{ top: `${topPct}%` }}
                        >
                          {/* Connector line */}
                          <div className={`erp-connector ${isLeft ? "left" : "right"}`} style={{ borderColor: statusCfg.color }} />
                          {/* Status dot on road */}
                          <div className={`erp-road-dot ${isLeft ? "left" : "right"}`} style={{ background: statusCfg.color, top: `${topPct}%` }} />

                          {/* Exit Card */}
                          <div
                            className={`erp-exit-card ${exit.status.toLowerCase()}`}
                            onClick={() => setDetailExit(exit)}
                          >
                            <div className="erp-exit-number">EXIT {idx + 1}</div>
                            <div className="erp-exit-name">{exit.name}</div>
                            <div className="erp-exit-meta">
                              <span className="erp-status-dot" style={{ background: statusCfg.color }}></span>
                              <span className="erp-status-label" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                              <span className="erp-exit-timeline">{exit.timeline}</span>
                            </div>
                            <div className="erp-exit-cost">{exit.cost}</div>
                            <button className="erp-view-btn" onClick={e => { e.stopPropagation(); setDetailExit(exit); }}>
                              ▼ View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Contract End */}
                    <div className="erp-contract-end">
                      <span>🏁 Contract End</span>
                    </div>
                  </div>
                </div>

                {/* Quick Reference */}
                <div className="erp-quick-ref">
                  <div className="erp-qr-title">QUICK REFERENCE</div>
                  <div className="erp-qr-items">
                    {summary.fastest && <div className="erp-qr-item"><span>⚡</span><strong>Fastest:</strong> {summary.fastest}</div>}
                    {summary.cheapest && <div className="erp-qr-item"><span>💰</span><strong>Cheapest:</strong> {summary.cheapest}</div>}
                    {summary.recommended && <div className="erp-qr-item"><span>✅</span><strong>Recommended:</strong> {summary.recommended}</div>}
                  </div>
                  <p className="erp-disclaimer">Disclaimer: This analysis is for informational purposes only and does not constitute legal advice. Consult qualified legal counsel before initiating any contract termination.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {detailExit && (
        <ExitDetailPanel exit={detailExit} onClose={() => setDetailExit(null)} />
      )}
    </div>
  );
}

/* ---- Exit Detail Side Panel ---- */
function ExitDetailPanel({ exit, onClose }) {
  const statusCfg = STATUS_CONFIG[exit.status] || STATUS_CONFIG.OPEN;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`erp-detail-overlay ${visible ? "visible" : ""}`} onClick={handleClose}>
      <div className={`erp-detail-panel ${visible ? "visible" : ""}`} onClick={e => e.stopPropagation()}>
        {/* Detail Header */}
        <div className="erp-detail-header">
          <div>
            <div className="erp-detail-clause">{exit.clause_ref}</div>
            <h2 className="erp-detail-title">{exit.name}</h2>
          </div>
          <button className="erp-detail-close" onClick={handleClose}><CloseX /></button>
        </div>

        <div className="erp-detail-body">
          {/* Plain English */}
          <div className="erp-plain-english">
            <div className="erp-pe-title"><BookIcon /> PLAIN ENGLISH</div>
            <p className="erp-pe-text">{exit.plain_english}</p>
            {exit.best_for && (
              <p className="erp-pe-bestfor"><strong>Best for:</strong> {exit.best_for}</p>
            )}
          </div>

          {/* Stats Row */}
          <div className="erp-stats-row">
            <div className="erp-stat-box">
              <div className="erp-stat-label">NOTICE</div>
              <div className="erp-stat-value">{exit.notice || "N/A"}</div>
            </div>
            <div className="erp-stat-box">
              <div className="erp-stat-label">COST</div>
              <div className="erp-stat-value">{exit.cost || "N/A"}</div>
            </div>
            <div className="erp-stat-box">
              <div className="erp-stat-label">TIMELINE</div>
              <div className="erp-stat-value">{exit.timeline || "N/A"}</div>
            </div>
          </div>

          {/* Requirements */}
          {exit.requirements?.length > 0 && (
            <div className="erp-section">
              <div className="erp-section-title"><AlertTriIcon /> REQUIREMENTS</div>
              <ul className="erp-req-list">
                {exit.requirements.map((req, i) => (
                  <li key={i}><span className="erp-req-arrow">›</span> {req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step-by-step */}
          {exit.steps?.length > 0 && (
            <div className="erp-section">
              <div className="erp-section-title"><MapIcon /> STEP-BY-STEP ROUTE</div>
              <ol className="erp-steps-list">
                {exit.steps.map((step, i) => (
                  <li key={i}>
                    <span className="erp-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Legal Tip */}
          {exit.legal_tip && (
            <div className="erp-legal-tip">
              <span className="erp-tip-icon">⚖️</span>
              <div>
                <strong>Legal Tip:</strong> {exit.legal_tip}
              </div>
            </div>
          )}

          {/* Risk Factors */}
          {exit.risks?.length > 0 && (
            <div className="erp-section">
              <div className="erp-section-title" style={{ color: "#ef4444" }}>⚠️ RISK FACTORS</div>
              <ul className="erp-req-list risk">
                {exit.risks.map((r, i) => (
                  <li key={i}><span className="erp-req-arrow" style={{ color: "#ef4444" }}>›</span> {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}