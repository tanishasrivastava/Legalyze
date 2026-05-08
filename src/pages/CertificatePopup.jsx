import React, { useEffect, useState, useRef } from "react";
import "./CertificatePopup.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const AI_API = import.meta.env.VITE_AI_API;

export default function CertificatePopup({ isOpen, onClose, contractText, perspective }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCertificate = async () => {
      setLoading(true);
      try {
  const res = await fetch(`${AI_API}/certificate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contract_text: contractText, perspective })
        });
        const result = await res.json();
        setData(result);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchCertificate();
  }, [isOpen, contractText, perspective]);

  const handleExportPDF = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Legalyze_Risk_Certificate.pdf");
  };

  if (!isOpen) return null;

  const passedCount = data?.findings?.filter(f => f.status === 'pass').length || 0;
  const cautionCount = data?.findings?.filter(f => f.status === 'caution').length || 0;

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cert-header">
          <h2>🛡️ Pre-Signing Risk Certificate</h2>
          <button className="close-x" onClick={onClose}>×</button>
        </div>

        <div className="cert-scroll-body">
          <div className="cert-paper" ref={certificateRef}>
            {/* Top Navy Banner */}
            <div className="paper-banner">
              <div className="banner-left">
                <strong>Legalyze Intelligence</strong>
                <span>Contract Risk Assessment Division</span>
              </div>
              <div className="banner-right">
                <p>PRE-SIGNING RISK CERTIFICATE</p>
                <p>CERTIFICATE NO. LGZ-{Math.random().toString(36).toUpperCase().substring(2,8)}</p>
              </div>
            </div>

            <div className="paper-content">
              <h1>Contract Risk Assessment Report</h1>
              <p className="intro-text">This certificate is generated pursuant to a comprehensive automated analysis. All assessments are generated using AI-powered legal intelligence and reflect the submitted version of the document.</p>

              {/* Scores Section */}
                            <div className="score-row">
                    <div className="score-item">
                <span className="label">OVERALL RISK SCORE</span>
                <div className="score-val">
                    {/* Ensure we show 'Loading...' or a dash if data isn't there yet */}
                    <span className="big-num">{data ? data.risk_score : "--"}</span>
                    <span className="small-den">/100</span>
                </div>
                <div className="risk-badge">
                    {data?.risk_score > 70 ? "LOW RISK" : "MODERATE RISK"}
                </div>
                </div>

                <div className="score-item">
                <span className="label">REGULATORY COMPLIANCE</span>
                <div className="score-val">
                    <span className="big-num blue-text">{data ? data.compliance_score : "--"}</span>
                    <span className="small-den">/100</span>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${data?.compliance_score || 0}%` }}></div>
                </div>
                </div>

                <div className="score-item">
                  <span className="label">SIGNING VERDICT</span>
                  <div className="verdict-title">{data?.verdict || "ANALYZING"}</div>
                  <div className="verdict-sub">Safe with Minor Modifications</div>
                </div>
              </div>

              {/* Table Section */}
              <div className="findings-section">
                <div className="findings-title">DETAILED FINDINGS ({data?.findings?.length || 0} AREAS ASSESSED)</div>
                <table className="findings-table">
                  <thead>
                    <tr>
                      <th>ASSESSMENT AREA</th>
                      <th>STATUS</th>
                      <th>FINDING</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.findings?.map((f, i) => (
                      <tr key={i}>
                        <td className="bold-cell">{f.title}</td>
                        <td className={`status-cell ${f.status}`}>
                          {f.status === 'pass' ? '✓ PASS' : '⚠️ CAUTION'}
                        </td>
                        <td className="desc-cell">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="table-footer-stats">
                  <span className="green-t">{passedCount} Passed</span>
                  <span className="orange-t">{cautionCount} Caution</span>
                  <span className="red-t">0 Failed</span>
                </div>
              </div>

              {/* Bottom Disclaimer */}
              <div className="cert-footer-info">
                <p className="disclaimer-txt">
                  <strong>Disclaimer:</strong> This certificate is generated by Legalyze Al and is intended for informational purposes only. It does not
constitute legal advice, legal representation, or a guarantee of contract enforceability. Parties should consult qualified
legal counsel before executing any agreement. This assessment is based on the document version submitted and
does not account for subsequent amendments or verbal agreements.
                </p>
                <div className="meta-and-seal">
                  <div className="meta-data">
                    <p><strong>Date of Issuance:</strong> April 6, 2026</p>
                    <p><strong>Assessment Engine:</strong> Legalyze v4.2 — NLP + Clause Intelligence</p>
                    <p><strong>Jurisdiction Basis:</strong> General Common Law (India)</p>
                  </div>
                  <div className="reviewed-seal-box">
                    <div className="seal-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="seal-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span>REVIEWED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-print" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
            Print Certificate
          </button>
          <button className="btn-export" onClick={handleExportPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export PDF
          </button>
          <button className="btn-copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Report ID
          </button>
        </div>
      </div>
    </div>
  );
}