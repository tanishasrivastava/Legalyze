import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Check, Users, FileText, Trash2, CheckCheck } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import "./Notifications.css";


const API = import.meta.env.VITE_AUTH_API;

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("email");

  useEffect(() => { fetchNotifications(); }, [email]);

  const fetchNotifications = async () => {
    try {
       const res = await axios.get(`${API}/api/notifications/${email}`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(`${API}/api/notifications/mark-all-read`, { email });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleAccept = async (notif) => {
    try {
      await axios.post(`${API}/api/notifications/accept-invite`, { notification_id: notif._id, team_id: notif.team_id, email });
      fetchNotifications();
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const handleDecline = async (notif) => {
    try {
      await axios.post(`${API}/api/notifications/decline-invite`, { notification_id: notif._id, team_id: notif.team_id, email });
      fetchNotifications();
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await axios.post(`${API}/api/notifications/mark-read`, { notification_id: notifId });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    const diff = Date.now() - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return d.toLocaleString("en-US",{hour:"numeric",minute:"2-digit"});
    return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  };

  if (loading) return <DashboardLayout><div style={{padding:40,color:"#64748b"}}>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="notif-page">
        <div className="notif-header">
          <div>
            <h1 className="notif-title">
              Notifications
              {unreadCount > 0 && <span className="notif-unread-badge">{unreadCount}</span>}
            </h1>
            <p className="notif-sub">Stay updated on invites, shared contracts, and risk alerts.</p>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllRead}>
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={36} strokeWidth={1.2} color="#94a3b8" />
            <h3>No notifications</h3>
            <p>Invitations and contract shares will appear here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <div key={notif._id} className={`notif-card ${!notif.read ? "unread" : ""}`}
                onClick={() => !notif.read && handleMarkRead(notif._id)}>
                <div className="notif-icon-wrap">
                  {notif.type === "invite"
                    ? <div className="notif-icon invite"><Users size={16}/></div>
                    : notif.type === "contract_shared"
                    ? <div className="notif-icon contract"><FileText size={16}/></div>
                    : notif.type === "team_deleted"
                    ? <div className="notif-icon deleted"><Trash2 size={16}/></div>
                    : <div className="notif-icon default"><Bell size={16}/></div>
                  }
                </div>
                <div className="notif-body">
                  <div className="notif-card-header">
                    <span className="notif-card-title">{notif.title}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span className="notif-date">{formatDate(notif.created_at)}</span>
                      {!notif.read && <span className="unread-dot"/>}
                    </div>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  {notif.type === "invite" && notif.status === "pending" && (
                    <div className="notif-actions">
                      <button className="btn-accept" onClick={e=>{e.stopPropagation();handleAccept(notif);}}>
                        <Check size={13}/> Accept
                      </button>
                      <button className="btn-decline" onClick={e=>{e.stopPropagation();handleDecline(notif);}}>
                        Decline
                      </button>
                    </div>
                  )}
                  {notif.type === "invite" && notif.status === "accepted" && <div className="notif-status accepted">✓ Accepted</div>}
                  {notif.type === "invite" && notif.status === "declined" && <div className="notif-status declined">✗ Declined</div>}
                  {notif.type === "contract_shared" && notif.analysis_result && (
                    <button className="btn-view-contract" onClick={e=>{e.stopPropagation();navigate("/analysis-result",{state:notif.analysis_result});}}>
                      View Analysis →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;