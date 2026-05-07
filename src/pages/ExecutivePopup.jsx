import React, { useState, useEffect } from "react";
import "./ExecutivePopup.css";

const ExecutivePopup = ({ isOpen, onClose, contractText, perspective }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && contractText) {
      setLoading(true);
      setData(null);
      fetch("http://localhost:8000/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_text: contractText, perspective }),
      })
        .then((res) => res.json())
        .then((json) => { setData(json); setLoading(false); })
        .catch((err) => { console.error("Error fetching summary:", err); setLoading(false); });
    }
  }, [isOpen, contractText, perspective]);

  const handlePrint    = () => window.print();
  const handleExportPDF = () => window.print();

  if (!isOpen) return null;

  return (
    <div className="exe-overlay">
      <div className="exe-modal">
        <div className="exe-header-nav no-print">
          <div className="exe-nav-title">
            <span className="exe-icon-small">📄</span> Executive Summary Generator
          </div>
          <button className="exe-close" onClick={onClose}>&times;</button>
        </div>

        <div className="exe-document" id="printable-executive-brief">
          {loading ? (
            /* ── Shimmer loader — matches SimulatorPopup exactly ── */
            <div className="exe-loader-wrap">
              <div className="exe-loader-track">
                <div className="exe-loader-fill" />
              </div>
              <p className="exe-loader-text">Generating Executive Briefing...</p>
              <span className="exe-loader-sub">
                Analyzing decision trees and financial impact. This may take up to a minute,
                based on the length of your contract.
              </span>
            </div>
          ) : (
            <>
              {/* Document Header */}
              <div className="doc-top-bar">
                <span>LEGALYZE INTELLIGENCE — EXECUTIVE BRIEFING</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="confidential-tag">CONFIDENTIAL — ATTORNEY-CLIENT PRIVILEGED</div>

              <h1 className="doc-title">Executive Summary</h1>
              <p className="doc-subtitle">Contract Intelligence Analysis — Q2 2026</p>

              <div className="doc-meta-grid">
                <div className="meta-item"><strong>PRINCIPAL PARTY:</strong> {data?.header?.principal_party || "N/A"}</div>
                <div className="meta-item"><strong>COUNTERPARTY:</strong> {data?.header?.counterparty || "N/A"}</div>
                <div className="meta-item"><strong>EFFECTIVE DATE:</strong> {data?.header?.effective_date || "N/A"}</div>
                <div className="meta-item"><strong>EXPIRY DATE:</strong> {data?.header?.expiry_date || "N/A"}</div>
                <div className="meta-item"><strong>CONTRACT VALUE:</strong> {data?.header?.contract_value || "N/A"}</div>
                <div className="meta-item"><strong>GOVERNING LAW:</strong> {data?.header?.governing_law || "N/A"}</div>
              </div>

              <div className={`risk-banner ${(data?.risk_assessment?.level || "moderate").toLowerCase()}`}>
                <div className="risk-label">
                  OVERALL RISK ASSESSMENT <h3>{data?.risk_assessment?.level || "PENDING"}</h3>
                </div>
                <div className="risk-circle">{data?.risk_assessment?.score || "0"}</div>
              </div>

              <section className="doc-section">
                <h4>SECTION I: Key Contractual Obligations</h4>
                <table className="exe-table">
                  <thead><tr><th>RESPONSIBLE</th><th>OBLIGATION</th><th>PRIORITY</th></tr></thead>
                  <tbody>
                    {data?.key_obligations?.map((o, i) => (
                      <tr key={i}>
                        <td>{o.party}</td>
                        <td>{o.obligation}</td>
                        <td><span className={`tag ${(o.priority || "medium").toLowerCase()}`}>{o.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="doc-section">
                <h4>SECTION II: Financial Commitments</h4>
                <table className="exe-table">
                  <thead><tr><th>DESCRIPTION</th><th>AMOUNT</th><th>DUE DATE</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {data?.financial_schedule?.map((f, i) => (
                      <tr key={i}>
                        <td>{f.description}</td><td>{f.amount}</td>
                        <td>{f.due_date}</td>
                        <td><span className="status-pill">{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <div className="legal-note">
                <strong>LEGAL COUNSEL ADVISORY NOTE:</strong>
                <p>{data?.legal_advisory || "No specific advisory notes for this document."}</p>
              </div>

              <div className="doc-footer">
                <div className="footer-brand">Legalyze Intelligence</div>
                <div className="footer-actions no-print">
                  <button onClick={handlePrint}>Print Brief</button>
                  <button className="primary" onClick={handleExportPDF}>Download PDF</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutivePopup;