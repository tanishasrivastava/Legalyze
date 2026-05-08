import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AmbiguityPopup.css";

const API = import.meta.env.VITE_AI_API;

const CloseX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AlertTriIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function AmbiguityPopup({ isOpen, onClose, contractText }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && contractText) {
      setLoading(true);
      axios.post(`${API}/ambiguity`, { 
        contract_text: contractText
      })
      .then(res => {
        setData(res.data.ambiguities || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setLoading(false);
      });
    }
  }, [isOpen, contractText]);

  if (!isOpen) return null;

  return (
    <div className="amb-overlay" onClick={onClose}>
      <div className="amb-modal" onClick={e => e.stopPropagation()}>
        
        <div className="amb-header">
          <div className="amb-header-left">
            <div className="amb-icon-box">
              <AlertTriIcon />
            </div>
            <div>
              <h2>AI Ambiguity Detector</h2>
              <p>Legal Intelligence</p>
            </div>
          </div>
          <button className="amb-close-btn" onClick={onClose}><CloseX /></button>
        </div>

        <div className="amb-content">
          {loading ? (
            <div className="amb-loading">
              <div className="amb-spinner"></div>
              <p>Analyzing contract for linguistic risks...</p>
            </div>
          ) : (
            <>
              <p className="amb-summary-text">
                {data.length} ambiguous clauses detected in your contract. Each includes an explanation and legally precise rewrite suggestion.
              </p>

              <div className="ct-ambiguity-list">
                {data.length > 0 ? (
                  data.map((item, idx) => (
                    <div className={`ct-ambiguity-item ${item.risk_level?.toLowerCase() || 'medium'}`} key={idx}>
                      <div className="ct-ambiguity-badge">
                        <AlertTriIcon /> Ambiguous Term: "{item.term}"
                      </div>
                      
                      <div className="ct-ambiguity-clause">
                        "{item.original_clause}"
                      </div>
                      
                      <div className="ct-ambiguity-explain">
                        {item.explanation}
                      </div>

                      <div className="ct-ambiguity-rewrite">
                        <div className="ct-ambiguity-rewrite-label">
                          <CheckCircleIcon /> Suggested Rewrite
                        </div>
                        <div className="ct-ambiguity-rewrite-text">
                          {item.suggested_rewrite}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="amb-empty">
                    <CheckCircleIcon />
                    <p>No ambiguities detected. This contract appears specific.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}