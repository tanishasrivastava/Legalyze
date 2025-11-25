import React, { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AnalysisResult.css";

// --- Helper Icons ---
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.93735 15.5L11 21L12.0627 15.5C12.5876 12.7819 14.7819 10.5876 17.5 10.0627L23 9L17.5 7.93735C14.7819 7.41238 12.5876 5.21814 12.0627 2.5L11 -3L9.93735 2.5C9.41238 5.21814 7.21814 7.41238 4.5 7.93735L-1 9L4.5 10.0627C7.21814 10.5876 9.41238 12.7819 9.93735 15.5Z" fill="url(#paint0_linear)" />
    <defs>
      <linearGradient id="paint0_linear" x1="11" y1="-3" x2="11" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);
const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
const CheckCircle = ({color}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const QuoteIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>;
const BrainIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const CopyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ChatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const FindIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const RefreshIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

// --- Sub Components ---

const RiskCard = ({ riskData, severity = "medium" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (riskData.suggested_change) {
      navigator.clipboard.writeText(riskData.suggested_change);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className={`risk-card ${severity}`}>
      <div className="risk-card-header"><span className="risk-label">{severity} Risk</span></div>
      <div className="risk-card-body">
        <div className="quote-section">
          <span className="quote-label"><QuoteIcon /> Quote from contract</span>
          <blockquote className="quote-text">"{riskData.clause}"</blockquote>
        </div>
        <div className="insight-section">
          <h4><BrainIcon /> AI Insight</h4>
          <p className="insight-text">{riskData.risk_explanation}</p>
        </div>
        {riskData.suggested_change && (
          <div className="suggested-box">
            <div className="suggested-header"><CheckCircle color="#166534" /> Suggested Change</div>
            <div className="suggested-content">
              <p className="suggested-text">{riskData.suggested_change}</p>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? <CheckIcon /> : <CopyIcon />}{copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccordionItem = ({ title, count, children, isOpen, onClick, type = "risk" }) => {
  return (
    <div className={`accordion-item ${isOpen ? "open" : ""}`}>
      <button className="accordion-trigger" onClick={onClick}>
        <div className="trigger-left">
          <span className="clause-title">{title}</span>
          {count > 0 && <span className={`risk-count ${type === 'safe' ? 'safe' : ''}`}>{count}</span>}
        </div>
        <div className="chevron"><ChevronDown /></div>
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

const SimplePieChart = ({ high, med, low }) => {
    const total = high + med + low;
    if (total === 0) return <p>No data</p>;
    const highDeg = (high / total) * 360;
    const medDeg = (med / total) * 360;
    const style = { width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(#ef4444 0deg ${highDeg}deg, #f59e0b ${highDeg}deg ${highDeg + medDeg}deg, #22c55e ${highDeg + medDeg}deg 360deg)` };
    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
            <div style={style}></div>
            <div style={{display:'flex', gap:10, fontSize:12}}>
                <span style={{color:'#ef4444'}}>● High ({high})</span><span style={{color:'#f59e0b'}}>● Med ({med})</span><span style={{color:'#22c55e'}}>● Safe ({low})</span>
            </div>
        </div>
    );
};

const SimpleBarChart = ({ partyA, scoreA, partyB, scoreB }) => {
    return (
        <div style={{width: '100%', display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:80, fontSize:12, textAlign:'right', fontWeight: 600}}>{partyA.length > 15 ? partyA.substring(0,15)+'...' : partyA}</div>
                <div style={{flex:1, background:'#f1f5f9', height:20, borderRadius:4, overflow:'hidden'}}><div style={{width: `${scoreA}%`, background:'#3b82f6', height:'100%'}}></div></div>
                <div style={{width:30, fontSize:12, fontWeight:600}}>{scoreA}%</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{width:80, fontSize:12, textAlign:'right', fontWeight: 600}}>{partyB.length > 15 ? partyB.substring(0,15)+'...' : partyB}</div>
                <div style={{flex:1, background:'#f1f5f9', height:20, borderRadius:4, overflow:'hidden'}}><div style={{width: `${scoreB}%`, background:'#94a3b8', height:'100%'}}></div></div>
                <div style={{width:30, fontSize:12, fontWeight:600}}>{scoreB}%</div>
            </div>
        </div>
    );
}

// --- AVATAR COMPONENT (USING emily.png) ---
const BotAvatar = () => (
    <img 
        src="/emily.png" 
        alt="Legal Bot"
        style={{
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            objectFit: 'cover',
            flexShrink: 0,
            backgroundColor: '#f1f5f9',
            border: '2px solid white'
        }}
    />
);

// --- HELPER: CLEAN MARKDOWN ---
const cleanMessage = (text) => {
    if (!text) return "";
    // Removes asterisks and hashtags used for markdown
    return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim();
};

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session_id, synopsis, risk_report, selected, full_text, parties } = location.state || {};

  const [openItems, setOpenItems] = useState({ high: true, low: false });
  const [sortMethod, setSortMethod] = useState("default"); 
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editorContent, setEditorContent] = useState(full_text || "");
  const [searchTerm, setSearchTerm] = useState("");
  const editorRef = useRef(null); 
  
  // Chatbot States
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
      { role: 'bot', text: 'Hello! I am Legalyze AI. Ask me anything about your contract or general legal questions.' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // SCROLL FIX: Using a timeout to ensure render is done
  useEffect(() => { 
      if (chatOpen) {
          setTimeout(() => {
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
      }
  }, [messages, chatOpen]);

  const counterPartyName = useMemo(() => {
      if (!parties || parties.length === 0) return "Counterparty";
      const others = parties.filter(p => p !== selected);
      return others.length > 0 ? others.join(", ") : "Counterparty";
  }, [parties, selected]);

  const data = useMemo(() => {
    if (!risk_report) return { risk_score: 0, favorability: {selected_party_score:50, counter_party_score:50}, high_risks: [], safe_clauses: [] };
    if (typeof risk_report === 'string') { try { return JSON.parse(risk_report); } catch(e) { return { risk_score: 0, favorability: {selected_party_score:50, counter_party_score:50}, high_risks: [], safe_clauses: [] }; } }
    return risk_report;
  }, [risk_report]);

  const sortedRisks = useMemo(() => {
      let risks = [...(data.high_risks || [])];
      if (sortMethod === "severity_desc") risks.sort((a, b) => (a.severity === "High" ? -1 : 1));
      else if (sortMethod === "severity_asc") risks.sort((a, b) => (a.severity === "High" ? 1 : -1));
      return risks;
  }, [data.high_risks, sortMethod]);

  const highCount = data.high_risks ? data.high_risks.filter(r => r.severity === "High").length : 0;
  const medCount = data.high_risks ? data.high_risks.filter(r => r.severity !== "High").length : 0;
  const lowCount = data.safe_clauses ? data.safe_clauses.length : 0;

  const toggleItem = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  const getScoreColor = (score) => { if (score >= 80) return "#22c55e"; if (score >= 50) return "#f59e0b"; return "#ef4444"; };

  const handleFind = () => {
      if (!searchTerm || !editorRef.current) return;
      const text = editorContent.toLowerCase();
      const query = searchTerm.toLowerCase();
      const index = text.indexOf(query);
      if (index !== -1) { editorRef.current.focus(); editorRef.current.setSelectionRange(index, index + query.length); } else { alert("Text not found in contract."); }
  };
  const handleClear = () => { if (window.confirm("Are you sure you want to clear the editor?")) setEditorContent(""); };
  const handleReset = () => { if (window.confirm("Reload original contract text? Unsaved edits will be lost.")) setEditorContent(full_text || ""); };
  const handleDownload = async () => {
      const formData = new FormData();
      formData.append("content", editorContent);
      formData.append("filename", "Edited_Contract.docx");
      try {
          const response = await fetch("http://127.0.0.1:8000/download-docx", { method: "POST", body: formData });
          if (response.ok) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "Edited_Contract.docx"; document.body.appendChild(a); a.click(); a.remove();
          } else { alert("Failed to generate DOCX"); }
      } catch (err) { console.error(err); alert("Error downloading file"); }
  };

  // --- CHATBOT FUNCTIONALITY ---
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    const formData = new FormData();
    formData.append("query", userMsg);

    try {
        const response = await fetch(`http://127.0.0.1:8000/analyze/${session_id}/ask`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        // Apply Cleaning to Response
        const cleanedResponse = cleanMessage(data.answer);
        setMessages(prev => [...prev, { role: 'bot', text: cleanedResponse }]);
    } catch (err) {
        setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error connecting to the server." }]);
    } finally {
        setChatLoading(false);
    }
  };

  if (!session_id) return <div style={{ padding: 40, textAlign: 'center' }}>No analysis found.</div>;

  return (
    <div className="ar-wrapper">
      <nav className="ar-topbar">
        {/* UPDATE: Added legal3.png Logo */}
        <div className="ar-brand">
            <img src="/legal3.png" alt="Legalyze Logo" style={{height: 32, marginRight: 12}} />
            Legalyze <span style={{fontWeight:400, color:'#94a3b8', marginLeft: 6}}>/ Analysis</span>
        </div>
        {/* UPDATE: Back button redirects to /upload */}
        <div className="ar-actions"><button onClick={() => navigate("/upload")}>Back to Upload</button></div>
      </nav>

      <div className="ar-split-layout">
          <div className="ar-left-panel">
              <div className="summary-card">
                <div className="summary-header"><SparklesIcon /><h1 className="doc-title">Contract Summary</h1></div>
                <div className="summary-content"><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{synopsis || "No summary generated."}</pre></div>
              </div>
              <div className="risk-score-banner">
                  <span className="score-label">Safety Score</span>
                  <div className="score-value-container">
                      <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${data.risk_score}%`, background: getScoreColor(data.risk_score) }} /></div>
                      <span className="score-number" style={{ color: getScoreColor(data.risk_score) }}>{data.risk_score}/100</span>
                  </div>
              </div>
              <div className="insights-header">
                <div className="insights-title-group"><h2>AI Insights</h2><span className="count-badge">{sortedRisks.length + data.safe_clauses.length}</span></div>
                <select className="sort-dropdown" value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                  <option value="default">Sort By: Clause Order</option>
                  <option value="severity_desc">Sort By: High Risk First</option>
                  <option value="severity_asc">Sort By: Low Risk First</option>
                </select>
              </div>
              <div className="insights-list">
                <AccordionItem title="Critical Risk Factors" count={sortedRisks.length} isOpen={openItems.high} onClick={() => toggleItem('high')}>
                  {sortedRisks.length === 0 ? <p className="insight-text" style={{paddingTop:20}}>No critical risks.</p> : 
                    sortedRisks.map((risk, i) => <RiskCard key={i} riskData={risk} severity={risk.severity ? risk.severity.toLowerCase() : "medium"} />)
                  }
                </AccordionItem>
                <AccordionItem title="Safe Clauses" count={data.safe_clauses.length} type="safe" isOpen={openItems.low} onClick={() => toggleItem('low')}>
                  <ul className="safe-list">{data.safe_clauses.map((item, i) => <li key={i}><CheckCircle color="#22c55e" /><span>{item}</span></li>)}</ul>
                </AccordionItem>
              </div>
          </div>

          <div className="ar-right-panel">
              <div className="right-tabs">
                  <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Analysis Dashboard</button>
                  <button className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>Edit Contract</button>
              </div>
              <div className="right-content">
                  {activeTab === 'dashboard' ? (
                      <>
                        <div className="chart-container"><div className="chart-title">Risk Distribution</div><SimplePieChart high={highCount} med={medCount} low={lowCount} /></div>
                        <div className="chart-container"><div className="chart-title">Favorability Scale</div><SimpleBarChart partyA={selected || "Selected"} scoreA={data.favorability?.selected_party_score || 50} partyB={counterPartyName} scoreB={data.favorability?.counter_party_score || 50} /></div>
                      </>
                  ) : (
                      <div className="editor-container">
                          <div className="editor-controls">
                              <div style={{display:'flex', gap:8, flex:1}}>
                                  <input type="text" placeholder="Find in contract..." className="editor-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFind()} />
                                  <button className="icon-btn" onClick={handleFind} title="Find Text"><FindIcon/></button>
                              </div>
                              <div style={{display:'flex', gap:8}}>
                                  <button className="icon-btn" onClick={handleReset} title="Reload Original"><RefreshIcon/></button>
                                  <button className="icon-btn" onClick={handleClear} title="Clear / Blank Page"><TrashIcon/></button>
                                  <button className="download-btn" onClick={handleDownload}>Download DOCX</button>
                              </div>
                          </div>
                          <textarea ref={editorRef} className="contract-editor" value={editorContent} onChange={(e) => setEditorContent(e.target.value)} placeholder="Start writing or editing here..." />
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* CHATBOT WIDGET */}
      <div className="chatbot-wrapper">
          {chatOpen && (
              <div className="chatbot-window">
                  <div className="chat-header">
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <BotAvatar />
                          <div style={{display:'flex', flexDirection:'column'}}>
                            <span>Legalyze AI</span>
                            <span style={{fontSize:10, opacity:0.8}}>Legal Assistant</span>
                          </div>
                      </div>
                      <div onClick={() => setChatOpen(false)} style={{cursor:'pointer'}}><CloseIcon/></div>
                  </div>
                  {/* SCROLL FIX: Ensuring scroll works by managing ref */}
                  <div className="chat-body">
                      {messages.map((msg, i) => (
                          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', marginBottom: 12 }}>
                              <div style={{ 
                                  padding: '10px 14px', 
                                  borderRadius: 12, 
                                  background: msg.role === 'user' ? '#3b82f6' : '#f1f5f9',
                                  color: msg.role === 'user' ? 'white' : '#334155',
                                  fontSize: 14,
                                  lineHeight: 1.5,
                                  whiteSpace: 'pre-wrap' 
                              }}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {chatLoading && <div style={{alignSelf:'flex-start', color:'#94a3b8', fontSize:12, marginLeft:10}}>Legalyze AI is typing...</div>}
                      <div ref={chatEndRef} />
                  </div>
                  <form className="chat-footer" onSubmit={handleChatSubmit}>
                      <input 
                          type="text" 
                          placeholder="Ask about this contract or legal terms..." 
                          value={chatInput} 
                          onChange={(e) => setChatInput(e.target.value)} 
                          disabled={chatLoading}
                      />
                      <button type="submit" disabled={chatLoading || !chatInput.trim()}><SendIcon /></button>
                  </form>
              </div>
          )}
          <button className="chatbot-toggle" onClick={() => setChatOpen(!chatOpen)}>
              {chatOpen ? <CloseIcon /> : <ChatIcon />}
          </button>
      </div>
    </div>
  );
}