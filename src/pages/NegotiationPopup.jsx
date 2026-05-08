import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NegotiationPopup.css";

const AI_API = import.meta.env.VITE_AI_API;

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const CloseX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export default function NegotiationPopup({ isOpen, onClose, contractText, perspective }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (isOpen && contractText) {
      setLoading(true);
       axios.post(`${AI_API}/negotiation-strategy`, {
        contract_text: contractText,
        perspective: perspective
      })
      .then(res => {
        setData(res.data.negotiations || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Negotiation API Error:", err);
        setLoading(false);
      });
    }
  }, [isOpen, contractText, perspective]);

  if (!isOpen) return null;

  return (
    <div className="adv-modal-overlay" onClick={onClose}>
      <div className="adv-modal-container" onClick={e => e.stopPropagation()}>
        <div className="adv-modal-header">
          <div className="adv-modal-title-area">
            <div className="adv-modal-icon negotiation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h2>AI Contract Negotiation Coach</h2>
              <span className="adv-modal-tag">Pre-Signing Strategy</span>
            </div>
          </div>
          <button className="adv-modal-close" onClick={onClose}><CloseX /></button>
        </div>

        <div className="adv-modal-content">
          {loading ? (
            <div className="adv-empty-state">
              <div className="loader-ring"></div>
              <p>Developing negotiation strategy...</p>
              <small>Analyzing specific clauses for {perspective}</small>
            </div>
          ) : (
            <div className="neg-coach-container">
              <p className="neg-coach-header-text">
                Top clauses you should negotiate before signing, ranked by potential impact on your position.
              </p>
              
              <div className="ct-negotiation-list">
                {data.length > 0 ? data.map((item, i) => (
                  <div className="ct-negotiation-item" key={i}>
                    <div className="ct-negotiation-rank">{i + 1}</div>
                    <div className="ct-negotiation-title">{item.title}</div>
                    <div className="ct-negotiation-issue">{item.issue}</div>
                    
                    <div className="ct-negotiation-script">
                      <div className="ct-negotiation-script-label">
                        <CheckCircleIcon /> Suggested Negotiation Line
                      </div>
                      <div className="ct-negotiation-script-text">"{item.script}"</div>
                    </div>

                    <div className="ct-negotiation-impact">
                      <span>Impact Score:</span>
                      <div className="ct-impact-bar">
                        <div 
                          className={`ct-impact-fill ${item.impactLevel}`} 
                          style={{ width: `${item.impact}%` }} 
                        />
                      </div>
                      <span className={`impact-pct ${item.impactLevel}`}>
                        {item.impact}%
                      </span>
                    </div>
                  </div>
                )) : (
                   <p className="adv-empty-text">No negotiation points found for this document.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}