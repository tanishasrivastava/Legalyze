import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import "./ContractEditor.css";

/* ─── ENV BASE URL ─── */
const AI_API = import.meta.env.VITE_AI_API;

/* ─── Icons ─── */
const EditPenIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CompareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/>
    <path d="M10 12h4"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M3 7v6h6"/><path d="M3 13C5 7 10 3 16 3a9 9 0 0 1 5 16"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M21 7v6h-6"/><path d="M21 13C19 7 14 3 8 3a9 9 0 0 0-5 16"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);
const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const DocxFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    <line x1="8" y1="9" x2="10" y2="9"/>
  </svg>
);
const HtmlFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const TextFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const NeutralIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

/* ─── Compute diff tokens ─── */
function computeDiff(original, edited) {
  const origWords = original.split(/(\s+)/);
  const editWords = edited.split(/(\s+)/);
  const result = [];
  let i = 0, j = 0;
  while (i < origWords.length || j < editWords.length) {
    if (i >= origWords.length) { result.push({ type: "add", text: editWords[j++] }); continue; }
    if (j >= editWords.length) { result.push({ type: "remove", text: origWords[i++] }); continue; }
    if (origWords[i] === editWords[j]) { result.push({ type: "same", text: origWords[i] }); i++; j++; }
    else {
      // simple look-ahead to match
      let found = false;
      for (let look = 1; look <= 5 && j + look < editWords.length; look++) {
        if (origWords[i] === editWords[j + look]) {
          for (let k = 0; k < look; k++) result.push({ type: "add", text: editWords[j + k] });
          j += look; found = true; break;
        }
      }
      if (!found) { result.push({ type: "remove", text: origWords[i++] }); result.push({ type: "add", text: editWords[j++] }); }
    }
  }
  return result;
}

/* ─── Safety score estimate per perspective ─── */
function estimateScoreImprovement(original, edited, baseScore, perspective) {
  const added   = (edited.split(/\s+/).length - original.split(/\s+/).length);
  const rawDelta = Math.min(Math.max(Math.round(added * 0.8), -10), 20);
  const persp = { neutral: 0, favor_user: 8, favor_counter: -4 };
  return Math.min(100, Math.max(0, baseScore + rawDelta + (persp[perspective] || 0)));
}

/* ─── Main ContractEditor ─── */
export default function ContractEditor({ fullText, safetyScore, parties, selected }) {
  const ORIGINAL = fullText || "";
  const [mode, setMode] = useState("edit"); // "edit" | "compare"
  const [content, setContent] = useState(ORIGINAL);
  const [fontSize, setFontSize] = useState(11);
  const [searchVal, setSearchVal] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [perspective, setPerspective] = useState("neutral");
  const [history, setHistory] = useState([ORIGINAL]);
  const [histIdx, setHistIdx] = useState(0);
  const textareaRef = useRef(null);
  const exportRef   = useRef(null);

  /* stats */
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars  = content.length;
  const pages  = Math.max(1, Math.ceil(words / 250));

  /* change count */
  const diffTokens = useMemo(() => computeDiff(ORIGINAL, content), [ORIGINAL, content]);
  const addedCount    = diffTokens.filter(t => t.type === "add"    && t.text.trim()).length;
  const removedCount  = diffTokens.filter(t => t.type === "remove" && t.text.trim()).length;
  const unchangedCount= diffTokens.filter(t => t.type === "same"   && t.text.trim()).length;
  const changeCount   = addedCount + removedCount;

  /* projected score */
  const projectedScore = useMemo(
    () => estimateScoreImprovement(ORIGINAL, content, safetyScore || 0, perspective),
    [ORIGINAL, content, safetyScore, perspective]
  );
  const delta = projectedScore - (safetyScore || 0);

  /* undo/redo */
  const pushHistory = useCallback((val) => {
    const next = history.slice(0, histIdx + 1);
    next.push(val);
    setHistory(next);
    setHistIdx(next.length - 1);
  }, [history, histIdx]);

  const handleChange = (e) => {
    setContent(e.target.value);
    pushHistory(e.target.value);
  };

  const undo = () => {
    if (histIdx > 0) { setHistIdx(h => h - 1); setContent(history[histIdx - 1]); }
  };
  const redo = () => {
    if (histIdx < history.length - 1) { setHistIdx(h => h + 1); setContent(history[histIdx + 1]); }
  };
  const reset = () => {
    if (window.confirm("Reload original contract? Unsaved edits will be lost.")) {
      setContent(ORIGINAL); pushHistory(ORIGINAL);
    }
  };

  /* find */
  const handleFind = () => {
    if (!searchVal || !textareaRef.current) return;
    const idx = content.toLowerCase().indexOf(searchVal.toLowerCase());
    if (idx !== -1) { textareaRef.current.focus(); textareaRef.current.setSelectionRange(idx, idx + searchVal.length); }
    else alert("Text not found.");
  };

  /* export */
  const exportDocx = async () => {
    setShowExport(false);
    const fd = new FormData();
    fd.append("content", content);
    fd.append("filename", "Edited_Contract.docx");
    try {
       const res = await fetch(`${AI_API}/download-docx`, { method: "POST", body: fd });
      if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "Edited_Contract.docx"; a.click(); }
      else alert("Export failed.");
    } catch { alert("Export error."); }
  };
  const exportHtml = () => {
    setShowExport(false);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contract</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;font-size:14px;line-height:1.8;color:#1a1a1a;}p{margin:1em 0}</style></head><body>${content.split("\n").map(l => `<p>${l}</p>`).join("")}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "Contract.html"; a.click();
  };
  const exportText = () => {
    setShowExport(false);
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "Contract.txt"; a.click();
  };

  /* close export on outside click */
  useEffect(() => {
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* perspective labels */
  const perspLabel = selected || "User";
  const counterLabel = parties?.filter(p => p !== selected)?.[0] || "Counterparty";

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="ce-root">
      {/* ── Top toolbar card ── */}
      <div className="ce-toolbar-card">
        {/* Row 1: mode tabs + change badge + export */}
        <div className="ce-toolbar-row1">
          <div className="ce-mode-tabs">
            <button className={`ce-mode-tab ${mode==="edit"?"active":""}`} onClick={()=>setMode("edit")}>
              <EditPenIcon/> Edit
            </button>
            <button className={`ce-mode-tab ${mode==="compare"?"active":""}`} onClick={()=>setMode("compare")}>
              <CompareIcon/> Compare
            </button>
          </div>
          {changeCount > 0 && (
            <div className="ce-change-badge">
              <span className="ce-change-dot"/>
              {changeCount} changes
            </div>
          )}
          <div className="ce-export-wrap" ref={exportRef}>
            <button className="ce-export-btn" onClick={()=>setShowExport(v=>!v)}>
              <ExportIcon/> Export <ChevronDownIcon/>
            </button>
            {showExport && (
              <div className="ce-export-menu">
                <button onClick={exportDocx}><DocxFileIcon/><div><span>DOCX</span><small>Microsoft Word format</small></div></button>
                <button onClick={exportHtml}><HtmlFileIcon/><div><span>HTML</span><small>Web-ready format</small></div></button>
                <button onClick={exportText}><TextFileIcon/><div><span>Plain Text</span><small>Universal format</small></div></button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: undo/redo, font size, reset */}
        <div className="ce-toolbar-row2">
          <button className="ce-tb-btn" onClick={undo} disabled={histIdx===0} title="Undo"><UndoIcon/></button>
          <button className="ce-tb-btn" onClick={redo} disabled={histIdx===history.length-1} title="Redo"><RedoIcon/></button>
          <div className="ce-tb-sep"/>
          <button className="ce-tb-btn" onClick={()=>setFontSize(f=>Math.max(8,f-1))} title="Decrease font">A−</button>
          <span className="ce-font-size">{fontSize}px</span>
          <button className="ce-tb-btn" onClick={()=>setFontSize(f=>Math.min(20,f+1))} title="Increase font">A+</button>
          <div className="ce-tb-sep"/>
          <button className="ce-tb-btn" onClick={reset} title="Reset to original"><ResetIcon/></button>
        </div>

        {/* Row 3: search */}
        <div className="ce-search-row">
          <div className="ce-search-box">
            <SearchIcon/>
            <input
              type="text"
              placeholder="Find text..."
              value={searchVal}
              onChange={e=>setSearchVal(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleFind()}
            />
            <button className="ce-search-reset" onClick={()=>setSearchVal("")} style={{opacity:searchVal?1:0}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Compare mode extras */}
        {mode === "compare" && (
          <>
            {/* Safety score comparison */}
            <div className="ce-score-compare">
              <div className="ce-score-box original">
                <div className="ce-score-label">ORIGINAL</div>
                <div className="ce-score-val" style={{color: scoreColor(safetyScore||0)}}>{safetyScore||0}</div>
                <div className="ce-score-sub">Safety Score</div>
              </div>
              <div className="ce-score-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={delta>=0?"#22c55e":"#ef4444"} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                <span className="ce-score-delta" style={{color: delta>=0?"#22c55e":"#ef4444"}}>
                  {delta>=0?"+":""}{delta} pts
                </span>
              </div>
              <div className="ce-score-box edited">
                <div className="ce-score-label">EDITED</div>
                <div className="ce-score-val" style={{color: scoreColor(projectedScore)}}>{projectedScore}</div>
                <div className="ce-score-sub">Projected Score</div>
              </div>
            </div>

            {/* Change stats */}
            <div className="ce-change-stats">
              <div className="ce-cs-box"><span className="ce-cs-num green">{addedCount}</span><span className="ce-cs-lbl">ADDED</span></div>
              <div className="ce-cs-box"><span className="ce-cs-num red">{removedCount}</span><span className="ce-cs-lbl">REMOVED</span></div>
              <div className="ce-cs-box"><span className="ce-cs-num blue">{unchangedCount}</span><span className="ce-cs-lbl">UNCHANGED</span></div>
            </div>
          </>
        )}

        {/* Perspective selector (compare mode) */}
        {mode === "compare" && (
          <div className="ce-persp-section">
            <div className="ce-persp-label">SAFETY ANALYSIS PERSPECTIVE:</div>
            <div className="ce-persp-btns">
              <button
                className={`ce-persp-btn ${perspective==="neutral"?"active-dark":""}`}
                onClick={()=>setPerspective("neutral")}
              >
                <NeutralIcon/> Neutral (All Parties)
              </button>
              <button
                className={`ce-persp-btn ${perspective==="favor_user"?"active-outline":""}`}
                onClick={()=>setPerspective("favor_user")}
              >
                <UserIcon/> Favor: {perspLabel.length>15?perspLabel.substring(0,15)+"…":perspLabel}
              </button>
              <button
                className={`ce-persp-btn ${perspective==="favor_counter"?"active-outline":""}`}
                onClick={()=>setPerspective("favor_counter")}
              >
                <UserIcon/> Favor: {counterLabel.length>15?counterLabel.substring(0,15)+"…":counterLabel}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats bar ── */}
      <div className="ce-stats-bar">
        <span>{pages} {pages===1?"page":"pages"}</span>
        <span>{words} words</span>
        <span>{chars} characters</span>
      </div>

      {/* ── Page body ── */}
      {mode === "edit" ? (
        <div className="ce-page-wrap">
          <div className="ce-page-header">
            <span>PAGE 1 OF {pages}</span>
            <span className="ce-page-tag">CONTRACT DOCUMENT</span>
          </div>
          <div className="ce-page-body">
            <textarea
              ref={textareaRef}
              className="ce-textarea"
              value={content}
              onChange={handleChange}
              style={{ fontSize: `${fontSize}px` }}
              spellCheck
            />
          </div>
          <div className="ce-page-footer">
            <span>CONFIDENTIAL</span>
            <span>PAGE 1</span>
          </div>
        </div>
      ) : (
        /* Compare mode */
        <div className="ce-page-wrap">
          <div className="ce-page-header">
            <span>TRACK CHANGES VIEW</span>
            <div className="ce-diff-legend">
              <span className="ce-diff-dot add"/> Added
              <span className="ce-diff-dot remove"/> Removed
            </div>
          </div>
          <div className="ce-page-body ce-diff-body" style={{ fontSize: `${fontSize}px` }}>
            {diffTokens.map((tok, i) => {
              if (tok.type === "same")   return <span key={i}>{tok.text}</span>;
              if (tok.type === "add")    return <span key={i} className="ce-diff-add">{tok.text}</span>;
              if (tok.type === "remove") return <span key={i} className="ce-diff-del">{tok.text}</span>;
              return null;
            })}
          </div>
          <div className="ce-page-footer">
            <span>CONFIDENTIAL</span>
            <span>PAGE 1</span>
          </div>
        </div>
      )}
    </div>
  );
}