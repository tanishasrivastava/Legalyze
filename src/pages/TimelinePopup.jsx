import React, { useState, useEffect } from "react";
import "./TimelinePopup.css";

/* ---------------- ICONS ---------------- */
const CloseX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TimelinePopup = ({ isOpen, onClose, sessionId, contractText }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      // Using the POST method from your logic requirement
      const response = await fetch("http://localhost:8000/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          session_id: sessionId,
          contract_text: contractText 
        }),
      });
      const data = await response.json();
      setEvents(data.timeline || []);
    } catch (err) {
      console.error("Error fetching timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToGoogleCalendar = () => {
    if (events.length === 0) return;
    const firstEvent = events[0];
    const title = encodeURIComponent(firstEvent.event);
    const details = encodeURIComponent(firstEvent.description || firstEvent.event);
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=20260315T090000Z/20260315T100000Z`;
    window.open(url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="tp-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="tp-header">
          <div className="tp-header-left">
            <div className="tp-icon-container">
              <CalendarIcon />
            </div>
            <div className="tp-title-stack">
              <h2>AI Legal Timeline Generator</h2>
              <p>Deadlines & Obligations</p>
            </div>
          </div>
          <button className="tp-close-btn" onClick={onClose}>
            <CloseX />
          </button>
        </div>

        {/* Body */}
        <div className="tp-body">
          <p className="tp-intro">Key dates and obligations extracted from your contract, organized chronologically.</p>
          
          {loading ? (
            <div className="tp-loading-state">
              <div className="tp-spinner"></div>
              <p>Extracting chronological data...</p>
            </div>
          ) : (
            <div className="tp-timeline-container">
              {events.map((item, idx) => (
                <div className="tp-row" key={idx}>
                  <div className="tp-left-rail">
                    <div className={`tp-rail-dot ${item.urgency || "normal"}`}></div>
                    {idx !== events.length - 1 && <div className="tp-rail-line"></div>}
                  </div>
                  <div className="tp-event-card">
                    <span className="tp-card-date">{item.date}</span>
                    <h4 className="tp-card-title">{item.event}</h4>
                    <p className="tp-card-desc">{item.description}</p>
                    {item.urgency === "urgent" && (
                      <div className="tp-badge urgent">⚠ URGENT</div>
                    )}
                    {item.urgency === "upcoming" && (
                      <div className="tp-badge upcoming">⏰ UPCOMING</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && events.length > 0 && (
          <div className="tp-footer">
            <button className="tp-google-btn" onClick={exportToGoogleCalendar}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="GCal" />
              Export to Google Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePopup;