import React, { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContractEditor from "./ContractEditor";
import "./AnalysisResult.css";

/* ─── Helper Icons ─── */
const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9.93735 15.5L11 21L12.0627 15.5C12.5876 12.7819 14.7819 10.5876 17.5 10.0627L23 9L17.5 7.93735C14.7819 7.41238 12.5876 5.21814 12.0627 2.5L11 -3L9.93735 2.5C9.41238 5.21814 7.21814 7.41238 4.5 7.93735L-1 9L4.5 10.0627C7.21814 10.5876 9.41238 12.7819 9.93735 15.5Z" fill="url(#p0)"/>
    <defs><linearGradient id="p0" x1="11" y1="-3" x2="11" y2="21" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient></defs>
  </svg>
);
const ChevronDown  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
const CheckCircle  = ({color}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const QuoteIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>;
const BrainIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const CopyIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const CheckIconSm  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const ChatIcon     = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const CloseIcon    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SendIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const ZapIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

/* ── KPI icon SVGs ── */
const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const TriangleAlertIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CircleCheckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const UserPlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

/* ─── Animated counter hook ─── */
function useAnimatedCount(target, duration = 1000, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return val;
}

function ProgressBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), delay + 300); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="ch-bar-row">
      <div className="ch-bar-top"><span className="ch-bar-label">{label}</span><span className="ch-bar-pct" style={{color}}>{value}%</span></div>
      <div className="ch-bar-track"><div className="ch-bar-fill" style={{width:`${width}%`,background:color,transitionDelay:`${delay}ms`}}/></div>
    </div>
  );
}

function DonutChart({ high, med, safe }) {
  const total = high + med + safe;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  if (total === 0) return null;
  const R = 54, C = 2 * Math.PI * R;
  const highPct = high/total, medPct = med/total, safePct = safe/total;
  const highDash = animated ? highPct*C : 0;
  const medDash  = animated ? medPct*C  : 0;
  const safeDash = animated ? safePct*C : 0;
  const medOff   = -(highPct*C);
  const safeOff  = -((highPct+medPct)*C);
  return (
    <div className="donut-wrap">
      <div className="donut-chart-box">
        <svg viewBox="0 0 120 120" className="donut-svg">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#f1f5f9" strokeWidth="14"/>
          <circle cx="60" cy="60" r={R} fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray={`${highDash} ${C}`} strokeDashoffset={0} style={{transition:"stroke-dasharray 1s ease",transform:"rotate(-90deg)",transformOrigin:"center"}}/>
          <circle cx="60" cy="60" r={R} fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray={`${medDash} ${C}`} strokeDashoffset={medOff} style={{transition:"stroke-dasharray 1s ease .2s",transform:"rotate(-90deg)",transformOrigin:"center"}}/>
          <circle cx="60" cy="60" r={R} fill="none" stroke="#22c55e" strokeWidth="14" strokeDasharray={`${safeDash} ${C}`} strokeDashoffset={safeOff} style={{transition:"stroke-dasharray 1s ease .4s",transform:"rotate(-90deg)",transformOrigin:"center"}}/>
          <text x="60" y="55" textAnchor="middle" className="donut-num">{total}</text>
          <text x="60" y="70" textAnchor="middle" className="donut-label">TOTAL</text>
        </svg>
      </div>
      <div className="donut-legend">
        <div className="donut-leg-row"><span className="donut-dot" style={{background:"#ef4444"}}/><span className="donut-leg-label">High Risk</span><span className="donut-leg-val">{high}</span></div>
        <div className="donut-leg-row"><span className="donut-dot" style={{background:"#f59e0b"}}/><span className="donut-leg-label">Medium</span><span className="donut-leg-val">{med}</span></div>
        <div className="donut-leg-row"><span className="donut-dot" style={{background:"#22c55e"}}/><span className="donut-leg-label">Safe</span><span className="donut-leg-val">{safe}</span></div>
      </div>
    </div>
  );
}

function FavorabilityBar({ scoreA, scoreB, nameA, nameB }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 600); return () => clearTimeout(t); }, []);
  const initA = nameA ? nameA[0].toUpperCase() : "A";
  const initB = nameB ? nameB[0].toUpperCase() : "B";
  const imbalance = Math.abs(scoreA - scoreB) >= 20;
  return (
    <div className="fav-wrap">
      <div className="fav-header"><h3 className="fav-title">Favorability Analysis</h3><span className="fav-badge">Comparative</span></div>
      <div className="fav-party-row">
        <div className="fav-avatar blue">{initA}</div>
        <div className="fav-party-info"><span className="fav-party-name">{nameA}</span><span className="fav-party-sub">Selected Party</span></div>
        <span className="fav-pct" style={{color:"#2563eb"}}>{scoreA}%</span>
      </div>
      <div className="fav-split-track">
        <div className="fav-split-a" style={{width:animated?`${scoreA}%`:"0%",transition:"width 1.1s cubic-bezier(.4,0,.2,1) .5s"}}/>
        <div className="fav-split-b" style={{width:animated?`${scoreB}%`:"0%",transition:"width 1.1s cubic-bezier(.4,0,.2,1) .5s"}}/>
      </div>
      <div className="fav-party-row" style={{marginTop:8}}>
        <div className="fav-avatar orange">{initB}</div>
        <div className="fav-party-info"><span className="fav-party-name">{nameB}</span><span className="fav-party-sub">Counter Party</span></div>
        <span className="fav-pct" style={{color:"#f59e0b"}}>{scoreB}%</span>
      </div>
      {imbalance && (
        <div className="fav-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          Significant imbalance detected — consider renegotiating terms
        </div>
      )}
    </div>
  );
}

function VerdictCard({ score }) {
  let icon, title, desc, cls;
  if (score >= 75)      { icon="✅"; title="Low Risk — Safe to Proceed";         desc="This contract appears well-balanced. Minor points to review before signing."; cls="verdict-low"; }
  else if (score >= 50) { icon="⚠️"; title="Moderate Risk — Review Recommended"; desc="Several clauses require attention. Consider negotiating key terms before signing."; cls="verdict-med"; }
  else                  { icon="🚨"; title="High Risk — Action Required";          desc="Critical clauses present significant risk. Do not sign without legal review."; cls="verdict-high"; }
  return (
    <div className={`verdict-card ${cls}`}>
      <div className="verdict-icon-box">{icon}</div>
      <div><div className="verdict-title">{title}</div><div className="verdict-desc">{desc}</div></div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, underColor, iconBg, delay }) {
  const animated = useAnimatedCount(typeof value === "number" ? value : 0, 1000, delay);
  return (
    <div className="kpi-card" style={{animationDelay:`${delay}ms`}}>
      <div className="kpi-icon-box" style={{background:iconBg}}>{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value-row">
        <span className="kpi-num">{typeof value === "number" ? animated : value}</span>
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
      <div className="kpi-underbar" style={{background:underColor}}/>
    </div>
  );
}

const RiskCard = ({ riskData, severity = "medium" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { if (riskData.suggested_change) { navigator.clipboard.writeText(riskData.suggested_change); setCopied(true); setTimeout(()=>setCopied(false),2000); } };
  return (
    <div className={`risk-card ${severity}`}>
      <div className="risk-card-header"><span className="risk-label">{severity} Risk</span></div>
      <div className="risk-card-body">
        <div className="quote-section">
          <span className="quote-label"><QuoteIcon /> Quote from contract</span>
          <blockquote className="quote-text">"{riskData.clause}"</blockquote>
        </div>
        <div className="insight-section"><h4><BrainIcon /> AI Insight</h4><p className="insight-text">{riskData.risk_explanation}</p></div>
        {riskData.suggested_change && (
          <div className="suggested-box">
            <div className="suggested-header"><CheckCircle color="#166534" /> Suggested Change</div>
            <div className="suggested-content">
              <p className="suggested-text">{riskData.suggested_change}</p>
              <button className="copy-btn" onClick={handleCopy}>{copied ? <CheckIconSm/> : <CopyIcon/>}{copied ? "Copied" : "Copy"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccordionItem = ({ title, count, children, isOpen, onClick, type="risk" }) => (
  <div className={`accordion-item ${isOpen?"open":""}`}>
    <button className="accordion-trigger" onClick={onClick}>
      <div className="trigger-left"><span className="clause-title">{title}</span>{count > 0 && <span className={`risk-count ${type==="safe"?"safe":""}`}>{count}</span>}</div>
      <div className="chevron"><ChevronDown/></div>
    </button>
    {isOpen && <div className="accordion-content">{children}</div>}
  </div>
);

const BotAvatar = () => (
  <img src="/emily.png" alt="Legal Bot" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0,backgroundColor:"#f1f5f9",border:"2px solid white"}}/>
);
const cleanMessage = (t) => t ? t.replace(/\*\*/g,"").replace(/\*/g,"").replace(/#/g,"").trim() : "";

/* ═══════════════════════════════════════ MAIN ═══════════════════════════════════════ */
export default function AnalysisResult() {
  const location = useLocation();
  const navigate  = useNavigate();
  const saved     = localStorage.getItem("analysisData");
  const stateData = location.state ? location.state : saved ? JSON.parse(saved) : null;
  const { session_id, synopsis, risk_report, selected, full_text, parties } = stateData || {};

  const [openItems,   setOpenItems]   = useState({ high:true, low:false });
  const [sortMethod,  setSortMethod]  = useState("default");
  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [chatOpen,    setChatOpen]    = useState(false);
  const [messages,    setMessages]    = useState([{role:"bot",text:"Hello! I am Legalyze AI. Ask me anything about your contract or general legal questions."}]);
  const [chatInput,   setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatOpen) setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),100);
  }, [messages, chatOpen]);

  useEffect(() => {
    if (location.state) localStorage.setItem("analysisData", JSON.stringify(location.state));
  }, [location.state]);

  const counterPartyName = useMemo(() => {
    if (!parties || parties.length === 0) return "Counterparty";
    const others = parties.filter(p => p !== selected);
    return others.length > 0 ? others.join(", ") : "Counterparty";
  }, [parties, selected]);

  const data = useMemo(() => {
    if (!risk_report) return {risk_score:0,favorability:{selected_party_score:50,counter_party_score:50},high_risks:[],safe_clauses:[]};
    if (typeof risk_report === "string") { try { return JSON.parse(risk_report); } catch { return {risk_score:0,favorability:{selected_party_score:50,counter_party_score:50},high_risks:[],safe_clauses:[]}; } }
    return risk_report;
  }, [risk_report]);

  const sortedRisks = useMemo(() => {
    let risks = [...(data.high_risks||[])];
    if (sortMethod==="severity_desc") risks.sort((a,b)=>a.severity==="High"?-1:1);
    else if (sortMethod==="severity_asc") risks.sort((a,b)=>a.severity==="High"?1:-1);
    return risks;
  }, [data.high_risks, sortMethod]);

  const highCount    = (data.high_risks||[]).filter(r=>r.severity==="High").length;
  const medCount     = (data.high_risks||[]).filter(r=>r.severity!=="High").length;
  const lowCount     = (data.safe_clauses||[]).length;
  const totalRisks   = (data.high_risks||[]).length;
  const partiesCount = parties ? parties.length : 0;
  const safetyScore  = data.risk_score || 0;
  const totalClauses = totalRisks + lowCount;
  const complianceScore = totalClauses > 0 ? Math.round(lowCount/totalClauses*100) : 0;
  const exposureScore   = totalClauses > 0 ? Math.round(highCount/totalClauses*100) : 0;

  const toggleItem = (key) => setOpenItems(prev=>({...prev,[key]:!prev[key]}));
  const getScoreColor = (s) => s >= 80 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()||chatLoading) return;
    const userMsg = chatInput.trim();
    setMessages(prev=>[...prev,{role:"user",text:userMsg}]);
    setChatInput(""); setChatLoading(true);
    const fd = new FormData(); fd.append("query",userMsg);
    try {
      const res  = await fetch(`http://127.0.0.1:8000/analyze/${session_id}/ask`,{method:"POST",body:fd});
      const json = await res.json();
      setMessages(prev=>[...prev,{role:"bot",text:cleanMessage(json.answer)}]);
    } catch { setMessages(prev=>[...prev,{role:"bot",text:"Sorry, I encountered an error."}]); }
    finally { setChatLoading(false); }
  };

  if (!session_id) return <div style={{padding:40,textAlign:"center"}}>No analysis found. Please re-upload your contract.</div>;

  return (
    <div className="ar-wrapper">
      <nav className="ar-topbar">
        <div className="ar-brand">
          <img src="/legal3.png" alt="Legalyze Logo" style={{height:32,marginRight:12}}/>
          Legalyze <span style={{fontWeight:400,color:"#94a3b8",marginLeft:6}}>/ Analysis</span>
        </div>
        <div className="ar-actions">
          <button onClick={()=>navigate("/dashboard")} style={{marginRight:10,background:"transparent",border:"1px solid #e2e8f0",color:"#64748b"}}>Back to Dashboard</button>
          <button onClick={()=>navigate("/upload")}>New Upload</button>
        </div>
      </nav>

      <div className="ar-split-layout">
        {/* LEFT */}
        <div className="ar-left-panel">
          <div className="summary-card">
            <div className="summary-header"><SparklesIcon/><h1 className="doc-title">Contract Summary</h1></div>
            <div className="summary-content"><pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{synopsis||"No summary generated."}</pre></div>
          </div>
          <div className="risk-score-banner">
            <span className="score-label">Safety Score</span>
            <div className="score-value-container">
              <div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${data.risk_score}%`,background:getScoreColor(data.risk_score)}}/></div>
              <span className="score-number" style={{color:getScoreColor(data.risk_score)}}>{data.risk_score}/100</span>
            </div>
          </div>
          <div className="insights-header">
            <div className="insights-title-group"><h2>AI Insights</h2><span className="count-badge">{sortedRisks.length+(data.safe_clauses||[]).length}</span></div>
            <select className="sort-dropdown" value={sortMethod} onChange={e=>setSortMethod(e.target.value)}>
              <option value="default">Sort By: Clause Order</option>
              <option value="severity_desc">Sort By: High Risk First</option>
              <option value="severity_asc">Sort By: Low Risk First</option>
            </select>
          </div>
          <div className="insights-list">
            <AccordionItem title="Critical Risk Factors" count={sortedRisks.length} isOpen={openItems.high} onClick={()=>toggleItem("high")}>
              {sortedRisks.length===0 ? <p className="insight-text" style={{paddingTop:20}}>No critical risks.</p>
                : sortedRisks.map((risk,i)=><RiskCard key={i} riskData={risk} severity={risk.severity?risk.severity.toLowerCase():"medium"}/>)}
            </AccordionItem>
            <AccordionItem title="Safe Clauses" count={(data.safe_clauses||[]).length} type="safe" isOpen={openItems.low} onClick={()=>toggleItem("low")}>
              <ul className="safe-list">{(data.safe_clauses||[]).map((item,i)=><li key={i}><CheckCircle color="#22c55e"/><span>{item}</span></li>)}</ul>
            </AccordionItem>
          </div>
        </div>

        {/* RIGHT */}
        <div className="ar-right-panel">
          <div className="right-tabs">
            <button className={`tab-btn ${activeTab==="dashboard"?"active":""}`} onClick={()=>setActiveTab("dashboard")}>Analysis Dashboard</button>
            <button className={`tab-btn ${activeTab==="editor"?"active":""}`} onClick={()=>setActiveTab("editor")}>
              ✏️ Edit Contract
            </button>
          </div>

          <div className="right-content">
            {activeTab === "dashboard" ? (
              <div className="dashboard-content-wrapper">
                <div className="kpi-grid">
                  <StatCard icon={<ShieldIcon/>} label="SAFETY SCORE" value={safetyScore} sub="/100" iconBg="linear-gradient(135deg,#4f8ef7,#3b82f6)" underColor="#3b82f6" delay={0}/>
                  <StatCard icon={<TriangleAlertIcon/>} label="TOTAL RISKS" value={totalRisks} iconBg="linear-gradient(135deg,#fb923c,#f97316)" underColor="#f97316" delay={100}/>
                  <StatCard icon={<CircleCheckIcon/>} label="SAFE CLAUSES" value={lowCount} iconBg="linear-gradient(135deg,#4ade80,#22c55e)" underColor="#22c55e" delay={200}/>
                  <StatCard icon={<UserPlusIcon/>} label="PARTIES" value={partiesCount} iconBg="linear-gradient(135deg,#c084fc,#a855f7)" underColor="#a855f7" delay={300}/>
                </div>
                <div className="db-card">
                  <div className="db-card-header"><h3 className="db-card-title">Risk Severity Breakdown</h3><span className="db-badge">{totalClauses} clauses analyzed</span></div>
                  <DonutChart high={highCount} med={medCount} safe={lowCount}/>
                </div>
                <div className="db-card">
                  <h3 className="db-card-title" style={{marginBottom:20}}>Contract Health</h3>
                  <ProgressBar label="Overall Safety"    value={safetyScore}    color="#f59e0b" delay={0}/>
                  <ProgressBar label="Clause Compliance" value={complianceScore} color="#22c55e" delay={150}/>
                  <ProgressBar label="Critical Exposure" value={exposureScore}  color="#ef4444" delay={300}/>
                </div>
                <div className="db-card">
                  <FavorabilityBar scoreA={data.favorability?.selected_party_score||50} scoreB={data.favorability?.counter_party_score||50} nameA={selected||"Selected Party"} nameB={counterPartyName}/>
                </div>
                <div className="db-card" style={{padding:0,overflow:"hidden"}}>
                  <VerdictCard score={safetyScore}/>
                </div>
                <button className="adv-tools-premium-btn" onClick={()=>navigate("/advanced-tools",{state:{session_id,full_text,perspective:selected,parties,synopsis,risk_report}})}>
                  <div className="adv-tools-btn-left">
                    <div className="adv-tools-btn-icon"><ZapIcon/></div>
                    <div className="adv-tools-btn-text">
                      <span className="adv-tools-btn-title">Explore Advanced AI Tools</span>
                      <span className="adv-tools-btn-sub">Clause extraction, ambiguity detection &amp; timelines</span>
                    </div>
                  </div>
                  <div className="adv-tools-btn-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></div>
                  <div className="adv-tools-btn-shine"/>
                </button>
              </div>
            ) : (
              /* ── UPGRADED EDITOR ── */
              <ContractEditor
                fullText={full_text || ""}
                safetyScore={safetyScore}
                parties={parties || []}
                selected={selected || ""}
              />
            )}
          </div>
        </div>
      </div>

      {/* CHATBOT */}
      <div className="chatbot-wrapper">
        {chatOpen && (
          <div className="chatbot-window">
            <div className="chat-header">
              <div style={{display:"flex",alignItems:"center",gap:10}}><BotAvatar/><div style={{display:"flex",flexDirection:"column"}}><span>Legalyze AI</span><span style={{fontSize:10,opacity:0.8}}>Legal Assistant</span></div></div>
              <div onClick={()=>setChatOpen(false)} style={{cursor:"pointer"}}><CloseIcon/></div>
            </div>
            <div className="chat-body">
              {messages.map((msg,i)=>(
                <div key={i} style={{alignSelf:msg.role==="user"?"flex-end":"flex-start",maxWidth:"80%",marginBottom:12}}>
                  <div style={{padding:"10px 14px",borderRadius:12,background:msg.role==="user"?"#3b82f6":"#f1f5f9",color:msg.role==="user"?"white":"#334155",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{msg.text}</div>
                </div>
              ))}
              {chatLoading && <div style={{alignSelf:"flex-start",color:"#94a3b8",fontSize:12,marginLeft:10}}>Legalyze AI is typing...</div>}
              <div ref={chatEndRef}/>
            </div>
            <form className="chat-footer" onSubmit={handleChatSubmit}>
              <input type="text" placeholder="Ask about this contract..." value={chatInput} onChange={e=>setChatInput(e.target.value)} disabled={chatLoading}/>
              <button type="submit" disabled={chatLoading||!chatInput.trim()}><SendIcon/></button>
            </form>
          </div>
        )}
        <button className="chatbot-toggle" onClick={()=>setChatOpen(!chatOpen)}>{chatOpen?<CloseIcon/>:<ChatIcon/>}</button>
      </div>
    </div>
  );
}