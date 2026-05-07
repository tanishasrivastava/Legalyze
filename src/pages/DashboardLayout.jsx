import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, FileText, Wrench, Users, UserCircle, LogOut, Scale, ChevronDown, Settings, Bell } from "lucide-react";
import "./DashboardLayout.css";

const API = "http://127.0.0.1:8000";
const NOTIF_POLL_INTERVAL = 120_000; // 2 minutes — not 30s

const DashboardLayout = ({ children }) => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const dropdownRef = useRef(null);

  const name          = localStorage.getItem("name")          || "User";
  const email         = localStorage.getItem("email")         || "";
  const workspaceType = localStorage.getItem("workspaceType") || "Individual";
  const userInitial   = name.substring(0, 2).toUpperCase();

  useEffect(() => {
    if (workspaceType !== "Business" || !email) return;
    const fetch = async () => {
      try {
   //     const res = await axios.get(`${API}/api/notifications/${email}`);
        setUnreadCount((res.data || []).filter((n) => !n.read).length);
      } catch (_) {}
    };
    fetch();
    const iv = setInterval(fetch, NOTIF_POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [email, workspaceType]);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const isActive = (p) => location.pathname === p;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-top-group">
          <div className="logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <Scale size={22} color="#2563eb" /><span>Legalyze</span>
          </div>
          <p className="nav-section-label">MENU</p>
          <nav className="nav">
            <Link to="/dashboard" className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}><LayoutDashboard size={18}/> Dashboard</Link>
            <Link to="/upload"    className={`nav-item ${isActive("/upload")    ? "active" : ""}`}><FileText size={18}/> Analyze</Link>
            <Link to="/tools"     className={`nav-item ${isActive("/tools")     ? "active" : ""}`}><Wrench size={18}/> AI Tools</Link>
            {workspaceType === "Business" && (
              <Link to="/teams" className={`nav-item ${isActive("/teams") ? "active" : ""}`}><Users size={18}/> Teams</Link>
            )}
          </nav>
          <p className="nav-section-label" style={{ marginTop: 12 }}>ACCOUNT</p>
          <nav className="nav">
            {workspaceType === "Business" && (
              <Link to="/notifications" className={`nav-item ${isActive("/notifications") ? "active" : ""}`}>
                <Bell size={18}/> Notifications
                {unreadCount > 0 && <span className="notif-nav-badge">{unreadCount}</span>}
              </Link>
            )}
            <Link to="/profile" className={`nav-item ${isActive("/profile") ? "active" : ""}`}><UserCircle size={18}/> Profile</Link>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{name}</p>
              <p className="sidebar-user-plan">{workspaceType} Plan</p>
            </div>
          </div>
          <button className="nav-item logout" onClick={handleLogout}><LogOut size={18}/> Sign Out</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-right" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setShowDropdown((p) => !p)}>
              <div className="avatar">{userInitial}</div>
              <div className="user-meta">
                <p className="username">{name} <ChevronDown size={14} className={showDropdown ? "rotate" : ""}/></p>
                <p className="plan">{workspaceType} Plan</p>
              </div>
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="avatar-small">{userInitial}</div>
                  <div className="header-text"><p className="d-name">{name}</p><p className="d-email">{email}</p></div>
                </div>
                <div className="dropdown-divider"/>
                <button className="dropdown-btn" onClick={() => { navigate("/profile"); setShowDropdown(false); }}><Settings size={16}/> Profile</button>
                <button className="dropdown-btn logout-btn" onClick={handleLogout}><LogOut size={16}/> Sign Out</button>
              </div>
            )}
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;