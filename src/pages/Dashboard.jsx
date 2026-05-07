import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, Shield, Wrench, Clock, TrendingUp, Upload, Users } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ stats: [], recent_contracts: [] });
  const [loading, setLoading] = useState(true);
  
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name") || "User";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fetching real data from your backend
        const res = await axios.get(`http://127.0.0.1:8000/api/user/dashboard-data/${email}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchDashboard();
  }, [email]);

  const handleContractClick = (contract) => {
    navigate("/analysis-result", { 
      state: { 
        session_id: contract.full_data.session_id,
        synopsis: contract.full_data.synopsis,
        risk_report: contract.full_data.risk_report,
        full_text: contract.full_data.full_text,
        selected: contract.full_data.selected,
        parties: contract.full_data.parties
      } 
    });
  };

  if (loading) return <div className="loading-screen">Loading your workspace...</div>;

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome back, {name}</h1>
          <p>Your contract intelligence is up to date.</p>
        </header>

        {/* Dynamic Stats Grid */}
        <div className="stats-grid">
          {data.stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-top">
                {stat.label.includes("Analyzed") ? <FileText size={18} color="#3b82f6"/> : <Shield size={18} color="#ef4444"/>}
                <TrendingUp size={14} className="trend-icon" />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate("/upload")}>
            <Upload size={24} />
            <h3>New Analysis</h3>
            <p>Upload a contract to see AI insights</p>
          </div>
         {/* FIX: LINKED TO TEAMS ROUTE */}
          <div className="action-card" onClick={() => navigate("/teams")}>
            <Users size={24} />
            <h3>Manage Teams</h3>
            <p>Collaborate with your organization</p>
          </div>
        </div>

        {/* Recent Contracts List */}
        <div className="recent-section">
          <h2>Recent Contracts</h2>
          <div className="contract-list">
            {data.recent_contracts.length > 0 ? (
              data.recent_contracts.map((contract) => (
                <div 
                  key={contract.id} 
                  className="contract-row clickable" 
                  onClick={() => handleContractClick(contract)}
                >
                  <div className="contract-left">
                    <FileText size={16} />
                    <div>
                      <p className="file-name">{contract.name}</p>
                      <p className="file-date">{contract.date}</p>
                    </div>
                  </div>
                  <div className="contract-right">
                    <span className={`badge ${contract.risk.toLowerCase()}`}>{contract.risk} Risk</span>
                    <span className="status">{contract.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No contracts found. Start by uploading one!</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;