import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users, Plus, UserPlus, Shield, Eye, Edit3, Trash2, X, Mail,
  ArrowLeft, Share2, Activity, FileText, ChevronRight
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import "./Teams.css";

const AUTH_API = import.meta.env.VITE_AUTH_API;
const AI_API = import.meta.env.VITE_AI_API;

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("members");
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [userContracts, setUserContracts] = useState([]);
  const [sharedContracts, setSharedContracts] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);

  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name") || "User";
  const workspaceType = localStorage.getItem("workspaceType") || "Individual";

  useEffect(() => {
    if (workspaceType !== "Business") navigate("/dashboard");
  }, [workspaceType, navigate]);

  useEffect(() => {
    if (workspaceType === "Business") fetchTeams();
  }, [email, workspaceType]);

  // ── Data fetchers ──────────────────────────────────────────

  const fetchTeams = async () => {
    try {
     const res = await axios.get(`${AI_API }/api/teams/${email}`);
      setTeams(res.data);
    } catch (err) {
      console.error("Teams fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetail = async (team) => {
    try {
      const [contractsRes, activityRes] = await Promise.all([
     axios.get(`${AI_API}/api/teams/${team._id}/contracts`),
  axios.get(`${AI_API}/api/teams/${team._id}/activity`),
      ]);
      setSharedContracts(contractsRes.data || []);
      setTeamActivity(activityRes.data || []);
    } catch (err) {
      console.error("Team detail fetch failed", err);
      setSharedContracts([]);
      setTeamActivity([]);
    }
  };

  const fetchUserContracts = async () => {
    try {
    const res = await axios.get(`${AI_API}/api/user/dashboard-data/${email}`);
      setUserContracts(res.data.recent_contracts || []);
    } catch (err) {
      console.error("User contracts fetch failed", err);
      setUserContracts([]);
    }
  };

  // ── Helpers ────────────────────────────────────────────────

  const refreshSelectedTeam = async (teamId) => {
  const res = await axios.get(`${AI_API}/api/teams/${email}`);
    setTeams(res.data);
    const updated = res.data.find(t => t._id === teamId);
    if (updated) {
      setSelectedTeam(updated);
      await fetchTeamDetail(updated);
    }
  };

  const isAdmin = (team) => team?.owner_email === email;

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    });
  };

  // ── Handlers ───────────────────────────────────────────────

  const handleViewTeam = async (team) => {
    setSelectedTeam(team);
    setActiveTab("members");
    await fetchTeamDetail(team);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
     await axios.post(`${AI_API}/api/teams/create`, {name: newTeamName, owner_email: email });
      setShowCreateModal(false);
      setNewTeamName("");
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating team");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
await axios.post(`${AI_API}/api/teams/invite`, {
        team_id: selectedTeam._id,
        email: inviteEmail,
        role: inviteRole,
        inviter_name: name,
        inviter_email: email,
      });
      setShowInviteModal(false);
      setInviteEmail("");
      await refreshSelectedTeam(selectedTeam._id);
    } catch (err) {
      alert(err.response?.data?.error || "Error sending invite");
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Delete team "${team.name}"? All members will be notified.`)) return;
    try {
      // admin_email passed as query param (matches the fixed backend)
     await axios.delete(
  `${AI_API}/api/teams/${team._id}?admin_email=${encodeURIComponent(email)}`
);
      setSelectedTeam(null);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting team");
    }
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!window.confirm(`Remove ${memberEmail} from team?`)) return;
    try {
   await axios.post(`${AI_API}/api/teams/remove-member`, {
        team_id: selectedTeam._id,
        member_email: memberEmail,
        admin_email: email,
      });
      await refreshSelectedTeam(selectedTeam._id);
    } catch (err) {
      alert(err.response?.data?.error || "Error removing member");
    }
  };

  const handleOpenShareModal = async () => {
    await fetchUserContracts();
    setShowShareModal(true);
  };

  const handleShareContract = async (contract) => {
    setShareLoading(true);
    try {
 await axios.post(`${AI_API}/api/teams/share-contract`, {
        team_id:         selectedTeam._id,
        contract_id:     contract.id,
        shared_by_email: email,
        shared_by_name:  name,
        contract_name:   contract.name,
      });
      setShowShareModal(false);
      // Refresh both shared contracts AND activity, then switch to contracts tab
      await fetchTeamDetail(selectedTeam);
      setActiveTab("contracts");
    } catch (err) {
      alert(err.response?.data?.error || "Error sharing contract");
    } finally {
      setShareLoading(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div className="teams-loading">Loading Teams...</div>
      </DashboardLayout>
    );
  }

  // ════════════════════════════════════════
  //  TEAM DETAIL VIEW
  // ════════════════════════════════════════
  if (selectedTeam) {
    const members = selectedTeam.members || [];
    const createdDate = selectedTeam.created_at
      ? new Date(selectedTeam.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Recently";

    return (
      <DashboardLayout>
        <div className="teams-page">

          {/* Back */}
          <div className="team-detail-back" onClick={() => setSelectedTeam(null)}>
            <ArrowLeft size={16} /> Back to Teams
          </div>

          {/* Header */}
          <div className="team-detail-header">
            <div className="team-detail-left">
              <div className="team-detail-icon"><Users size={22} /></div>
              <div>
                <h2 className="team-detail-name">{selectedTeam.name}</h2>
                <p className="team-detail-meta">{members.length} members · Created {createdDate}</p>
              </div>
            </div>
            <div className="team-detail-actions">
              <button className="btn-share-contract" onClick={handleOpenShareModal}>
                <Share2 size={15} /> Share Contract
              </button>
              <button className="btn-invite-primary" onClick={() => setShowInviteModal(true)}>
                <UserPlus size={15} /> Invite
              </button>
              {isAdmin(selectedTeam) && (
                <button className="btn-delete-team" onClick={() => handleDeleteTeam(selectedTeam)}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="team-tabs">
            <button
              className={`team-tab ${activeTab === "members" ? "active" : ""}`}
              onClick={() => setActiveTab("members")}
            >
              <Users size={14} /> Members
              <span className="tab-count">{members.length}</span>
            </button>
            <button
              className={`team-tab ${activeTab === "contracts" ? "active" : ""}`}
              onClick={() => { setActiveTab("contracts"); fetchTeamDetail(selectedTeam); }}
            >
              <FileText size={14} /> Shared Contracts
              <span className="tab-count">{sharedContracts.length}</span>
            </button>
            <button
              className={`team-tab ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => { setActiveTab("activity"); fetchTeamDetail(selectedTeam); }}
            >
              <Activity size={14} /> Activity
              <span className="tab-count">{teamActivity.length}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="team-tab-content">

            {/* ── MEMBERS ── */}
            {activeTab === "members" && (
              <div className="members-tab">
                {members.map((member, idx) => (
                  <div key={idx} className="member-row">
                    <div className="member-row-left">
                      <div className="member-avatar-lg" style={{ position: "relative" }}>
                        {member.email[0].toUpperCase()}
                        {member.status === "pending" && <span className="pending-dot" />}
                      </div>
                      <div className="member-row-info">
                        <div className="member-row-name">
                          {member.name || member.email.split("@")[0]}
                          {member.status === "pending" && (
                            <span className="pending-badge">Pending</span>
                          )}
                        </div>
                        <div className="member-row-email">{member.email}</div>
                      </div>
                    </div>
                    <div className="member-row-right">
                      <span className={`role-chip ${member.role.toLowerCase()}`}>
                        {member.role === "Admin"  ? <Shield size={11} /> :
                         member.role === "Editor" ? <Edit3 size={11} />  : <Eye size={11} />}
                        {member.role}
                      </span>
                      {member.email !== email && isAdmin(selectedTeam) && (
                        <button className="remove-btn" onClick={() => handleRemoveMember(member.email)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── SHARED CONTRACTS ── */}
            {activeTab === "contracts" && (
              <div className="contracts-tab">
                {sharedContracts.length === 0 ? (
                  <div className="contracts-empty">
                    <FileText size={36} strokeWidth={1.2} color="#94a3b8" />
                    <h3>No shared contracts</h3>
                    <p>Share contracts with your team to start collaborating.</p>
                    <button className="btn-share-empty" onClick={handleOpenShareModal}>
                      <Share2 size={15} /> Share Contract
                    </button>
                  </div>
                ) : (
                  sharedContracts.map((c, idx) => (
                    <div
                      key={idx}
                      className="shared-contract-row"
                      onClick={() => navigate("/analysis-result", { state: c.analysis_result })}
                    >
                      <div className="sc-left">
                        <div className="sc-icon"><FileText size={16} /></div>
                        <div>
                          <div className="sc-name">{c.contract_name}</div>
                          <div className="sc-meta">
                            Shared by {c.shared_by_name} · {formatTime(c.shared_at)}
                          </div>
                        </div>
                      </div>
                      <div className="sc-right">
                        <span className={`risk-badge ${(c.risk_level || "").toLowerCase()}`}>
                          {c.risk_level} Risk
                        </span>
                        <ChevronRight size={16} color="#94a3b8" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── ACTIVITY ── */}
            {activeTab === "activity" && (
              <div className="activity-tab">
                {teamActivity.length === 0 ? (
                  <div className="contracts-empty">
                    <Activity size={36} strokeWidth={1.2} color="#94a3b8" />
                    <h3>No activity yet</h3>
                    <p>Team actions will appear here.</p>
                  </div>
                ) : (
                  teamActivity.map((act, idx) => (
                    <div key={idx} className="activity-row">
                      <div className="act-avatar">
                        {(act.actor_name || act.actor_email || "U")[0].toUpperCase()}
                      </div>
                      <div className="act-body">
                        <div className="act-text">{act.description}</div>
                        <div className="act-time">{formatTime(act.created_at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── INVITE MODAL ── */}
        {showInviteModal && (
          <div className="modal-backdrop">
            <div className="modal-box invite-box">
              <div className="modal-header">
                <h3>Invite to {selectedTeam?.name}</h3>
                <X className="close-x" size={18} onClick={() => setShowInviteModal(false)} />
              </div>
              <div className="modal-body">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={14} />
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleInvite()}
                  />
                </div>
                <label>Assign Role</label>
                <div className="role-grid">
                  {["Viewer", "Editor", "Admin"].map(r => (
                    <div
                      key={r}
                      className={`role-select-item ${inviteRole === r ? "active" : ""}`}
                      onClick={() => setInviteRole(r)}
                    >
                      {r === "Admin"  ? <Shield size={12} /> :
                       r === "Editor" ? <Edit3 size={12} />  : <Eye size={12} />}
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
                <button className="modal-submit" onClick={handleInvite}>Send Invitation</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SHARE CONTRACT MODAL ── */}
        {showShareModal && (
          <div className="modal-backdrop">
            <div className="modal-box share-box">
              <div className="modal-header">
                <h3>Share Contract with {selectedTeam?.name}</h3>
                <X className="close-x" size={18} onClick={() => setShowShareModal(false)} />
              </div>
              <div className="modal-body">
                <p className="share-hint">
                  Select a contract from your history to share with all team members.
                </p>
                {userContracts.length === 0 ? (
                  <div className="no-contracts-msg">
                    No contracts found. Analyze a contract first.
                  </div>
                ) : (
                  <div className="contract-pick-list">
                    {userContracts.map((c, idx) => (
                      <div
                        key={idx}
                        className={`contract-pick-row ${shareLoading ? "disabled" : ""}`}
                        onClick={() => !shareLoading && handleShareContract(c)}
                      >
                        <div className="cp-left">
                          <FileText size={15} color="#3b82f6" />
                          <div>
                            <div className="cp-name">{c.name}</div>
                            <div className="cp-date">{c.date}</div>
                          </div>
                        </div>
                        <span className={`risk-badge ${(c.risk || "").toLowerCase()}`}>
                          {c.risk}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {shareLoading && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
                    Sharing...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ════════════════════════════════════════
  //  TEAMS LIST VIEW
  // ════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="teams-page">
        <div className="teams-header">
          <div>
            <h1>Teams</h1>
            <p>Collaborate with your legal department and stakeholders.</p>
          </div>
          {teams.length > 0 && (
            <button className="create-btn-top" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> New Team
            </button>
          )}
        </div>

        {teams.length === 0 ? (
          <div className="teams-empty-state">
            <div className="empty-illustration"><Users size={32} /></div>
            <h2>No teams yet</h2>
            <p>Create a team to share contracts and collaborate.</p>
            <button className="btn-primary-action" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Create your first team
            </button>
          </div>
        ) : (
          <div className="teams-grid">
            {teams.map(team => {
              const pending = (team.members || []).filter(m => m.status === "pending").length;
              return (
                <div key={team._id} className="team-card">
                  <div className="team-card-header">
                    <div className="team-title-sec">
                      <div className="team-icon-box"><Users size={18} /></div>
                      <div>
                        <h3>{team.name}</h3>
                        <p>
                          {team.members.length} Members
                          {pending > 0 ? ` · ${pending} pending` : ""}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="invite-btn-small"
                        onClick={() => { setSelectedTeam(team); setShowInviteModal(true); }}
                      >
                        <UserPlus size={14} /> Invite
                      </button>
                      {isAdmin(team) && (
                        <button className="delete-btn-small" onClick={() => handleDeleteTeam(team)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="members-list">
                    {team.members.slice(0, 3).map((member, idx) => (
                      <div key={idx} className="member-item">
                        <div className="member-info">
                          <div className="member-avatar" style={{ position: "relative" }}>
                            {member.email[0].toUpperCase()}
                            {member.status === "pending" && <span className="mini-pending-dot" />}
                          </div>
                          <div className="member-text">
                            <p className="m-name">{member.name || member.email.split("@")[0]}</p>
                            <p className="m-email">{member.email}</p>
                          </div>
                        </div>
                        <span className={`role-pill ${member.role.toLowerCase()}`}>
                          {member.role === "Admin"  ? <Shield size={10} /> :
                           member.role === "Editor" ? <Edit3 size={10} />  : <Eye size={10} />}
                          {member.role}
                        </span>
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <p className="more-members">+{team.members.length - 3} more</p>
                    )}
                  </div>

                  <button className="view-team-btn" onClick={() => handleViewTeam(team)}>
                    View Team <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <div className="modal-header">
                <h3>Create New Team</h3>
                <X className="close-x" size={18} onClick={() => setShowCreateModal(false)} />
              </div>
              <div className="modal-body">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Finance Legal Review"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreateTeam()}
                />
                <button className="modal-submit" onClick={handleCreateTeam}>Create Team</button>
              </div>
            </div>
          </div>
        )}

        {/* INVITE from list view (no selectedTeam detail open) */}
        {showInviteModal && selectedTeam && !selectedTeam._detailOpen && (
          <div className="modal-backdrop">
            <div className="modal-box invite-box">
              <div className="modal-header">
                <h3>Invite to {selectedTeam?.name}</h3>
                <X className="close-x" size={18} onClick={() => { setShowInviteModal(false); setSelectedTeam(null); }} />
              </div>
              <div className="modal-body">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={14} />
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                  />
                </div>
                <label>Assign Role</label>
                <div className="role-grid">
                  {["Viewer", "Editor", "Admin"].map(r => (
                    <div
                      key={r}
                      className={`role-select-item ${inviteRole === r ? "active" : ""}`}
                      onClick={() => setInviteRole(r)}
                    >
                      {r === "Admin"  ? <Shield size={12} /> :
                       r === "Editor" ? <Edit3 size={12} />  : <Eye size={12} />}
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
                <button className="modal-submit" onClick={handleInvite}>Send Invitation</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teams;