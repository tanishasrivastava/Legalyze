import React, { useState, useEffect, useRef } from "react";
import { X, DollarSign, AlertTriangle, TrendingUp, Download, Printer, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./FinancialPopup.css";

const FinancialPopup = ({ isOpen, onClose, contractText, perspective }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    if (isOpen && contractText) {
      fetchFinancialData();
    }
  }, [isOpen, contractText]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/financial-exposure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_text: contractText, perspective })
      });
      
      const result = await response.json();
      
      if (result.error || !result.kpis) {
        setError(result.error || "Financial data unavailable.");
      } else {
        setData(result);
      }
    } catch (err) {
      setError("Failed to connect to the server.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format numbers with the dynamic currency symbol from backend
  const formatCurrency = (val) => {
    const symbol = data?.currency_symbol || "$";
    return `${symbol}${val?.toLocaleString() || "0"}`;
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const exportPDF = async () => {
    const canvas = await html2canvas(componentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save("Financial_Exposure_Report.pdf");
  };

  if (!isOpen) return null;

  return (
    <div className="fin-overlay">
      <div className="fin-modal">
        <div className="fin-header">
          <div className="fin-header-left">
            <div className="fin-icon-bg"><DollarSign size={24} /></div>
            <div>
              <h2>AI Financial Exposure Calculator</h2>
              <p>Real-time Cost & Liability Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="close-x"><X /></button>
        </div>

        <div className="fin-content" ref={componentRef}>
          {loading ? (
            <div className="fin-loading">
              <Loader2 className="spinner" />
              <p>Auditing contract finances...</p>
            </div>
          ) : error ? (
            <div className="fin-error-state">
              <AlertTriangle size={48} color="#ef4444" />
              <h3>Analysis Failed</h3>
              <p>{error}</p>
              <button onClick={fetchFinancialData} className="btn-sec">Retry Analysis</button>
            </div>
          ) : (
            <>
              {/* KPI Section with Dynamic Symbols */}
              <div className="fin-kpi-grid">
                <div className="kpi-card">
                  <span>TOTAL CONTRACT VALUE</span>
                  <h3>{formatCurrency(data?.kpis?.total_contract_value)}</h3>
                </div>
                <div className="kpi-card danger">
                  <span>WORST-CASE EXPOSURE</span>
                  <h3>{formatCurrency(data?.kpis?.worst_case_exposure)}</h3>
                </div>
                <div className="kpi-card warning">
                  <span>EXPOSURE MULTIPLE</span>
                  <h3>{data?.kpis?.exposure_multiple || "N/A"}</h3>
                </div>
              </div>

              {/* Penalty Table (Strings like p.cost already include symbol from backend) */}
              <div className="fin-section">
                <h4 className="sec-title"><AlertTriangle size={18} /> Penalty Triggers</h4>
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>Trigger</th>
                      <th>Cost</th>
                      <th>Max Exposure</th>
                      <th>Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.penalty_triggers?.map((p, i) => (
                      <tr key={i}>
                        <td>{p.trigger}</td>
                        <td>{p.cost}</td>
                        <td className="text-red">{p.max_exposure}</td>
                        <td>
                          <span className={`prob-tag ${p.probability?.toLowerCase()}`}>
                            {p.probability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hidden Costs */}
              <div className="fin-section">
                <h4 className="sec-title"><TrendingUp size={18} /> Hidden & Indirect Costs</h4>
                <div className="hidden-costs-grid">
                  {data?.hidden_costs?.map((c, i) => (
                    <div className="cost-box" key={i}>
                      <h5>{c.title}</h5>
                      <p className="amt">{c.amount}</p>
                      <p className="exp">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown Bars with Dynamic Symbols */}
              <div className="fin-section">
                <h4 className="sec-title">Cost Breakdown</h4>
                <div className="breakdown-container">
                  {data?.breakdown && Object.entries(data.breakdown).map(([key, val], i) => (
                    <div className="bar-row" key={i}>
                      <span className="bar-label">{key.replace("_", " ")}</span>
                      <div className="bar-wrapper">
                        <div 
                          className={`bar-fill fill-${i}`} 
                          style={{ width: `${Math.min((val / (data.kpis.worst_case_exposure || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="bar-val">{formatCurrency(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Advisory */}
              {data?.financial_advisory && (
                <div className="fin-section">
                   <h4 className="sec-title">Financial Advisory</h4>
                   <p className="advisory-text">{data.financial_advisory}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="fin-footer no-print">
          <button className="btn-sec" onClick={handlePrint} disabled={loading || !!error}>
            <Printer size={16}/> Print Report
          </button>
          <button className="btn-pri" onClick={exportPDF} disabled={loading || !!error}>
            <Download size={16}/> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialPopup;