import React, { useState } from "react";
import axios from "axios";
import { User, Mail, Building2, Briefcase, Save, UserCircle, Camera } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import "./Profile.css";

const AI_API = import.meta.env.VITE_AI_API;

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    company: localStorage.getItem("company") || "",
    role: localStorage.getItem("role") || "",
    workspaceType: localStorage.getItem("workspaceType") || "Individual",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
        await axios.post(`${AI_API}/api/user/update-profile`, formData);
      localStorage.setItem("name", formData.fullName);
      localStorage.setItem("company", formData.company);
      localStorage.setItem("role", formData.role);
      localStorage.setItem("workspaceType", formData.workspaceType);
      
      // Trigger a sync for Sidebar/Dashboard
      window.dispatchEvent(new Event("storage"));
      
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-container">
        <header className="profile-header-text">
          <h1>Profile Settings</h1>
          <p>Manage your account and preferences.</p>
        </header>

        {/* HERO CARD */}
        <div className="profile-section-card hero-compact">
          <div className="avatar-wrapper">
            <div className="profile-avatar-main">
              {formData.fullName.substring(0, 2).toUpperCase()}
              <div className="avatar-edit-badge">
                <Camera size={12} color="white" />
              </div>
            </div>
            <div className="user-meta-info">
              <h2>{formData.fullName}</h2>
              <p>{formData.email}</p>
              <div className={`plan-pill ${formData.workspaceType.toLowerCase()}`}>
                <Building2 size={12} /> {formData.workspaceType} Plan
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="profile-section-card">
          <h3 className="section-subtitle">Personal Information</h3>
          <div className="form-grid">
            <div className="input-field">
              <label><User size={14}/> Full Name</label>
              <input 
                type="text" 
                placeholder="Google User"
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="input-field">
              <label><Mail size={14}/> Email</label>
              <input type="email" value={formData.email} disabled className="input-readonly" />
            </div>
            
            <div className="form-row">
              <div className="input-field">
                <label><Building2 size={14}/> Company</label>
                <input 
                  type="text" 
                  placeholder="Your company name"
                  value={formData.company} 
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label><Briefcase size={14}/> Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Legal Counsel"
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </div>
            </div>
          </div>
          <button className="btn-save-profile" onClick={handleSave} disabled={loading}>
            <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* WORKSPACE SELECTION */}
        <div className="profile-section-card">
          <h3 className="section-subtitle">Workspace Type</h3>
          <div className="workspace-selector-grid">
            <div 
              className={`workspace-box ${formData.workspaceType === "Individual" ? "selected" : ""}`}
              onClick={() => setFormData({...formData, workspaceType: "Individual"})}
            >
              <UserCircle size={20} className="ws-icon" />
              <div className="ws-text">
                <span className="ws-title">Individual</span>
                <span className="ws-desc">Personal workspace</span>
              </div>
            </div>
            <div 
              className={`workspace-box ${formData.workspaceType === "Business" ? "selected" : ""}`}
              onClick={() => setFormData({...formData, workspaceType: "Business"})}
            >
              <Building2 size={20} className="ws-icon" />
              <div className="ws-text">
                <span className="ws-title">Business</span>
                <span className="ws-desc">Team collaboration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;