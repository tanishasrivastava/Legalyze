import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./ReviewsPage.css";

const API = import.meta.env.VITE_AUTH_API;

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name") || "User";
  const userInitial = name[0].toUpperCase();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchReviews = async () => {
      try {
       const res = await axios.get(`${API}/api/reviews/${email}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews", err);
      }
    };
    fetchReviews();
  }, [email]);

  const handleDelete = async (id) => {
    try {
    await axios.delete(`${API}/api/reviews/${id}`);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting review", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // ✅ Redirect to HomePage
  };

  return (
    <div className="reviews-container">
      {/* ===== HEADER ===== */}
      <header className="reviews-header">
        <div className="header-left">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/02/Scale_of_justice_2.svg"
            alt="Legalyze Logo"
            className="logo-icon"
          />
          <h1 className="logo-text">Legalyze</h1>
        </div>

        <div className="nav-right">
          <button className="upgrade-btn">Upgrade Plan</button>

          {/* USER PROFILE ICON */}
          <div
            className="user-icon"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userInitial}
          </div>

          {/* PROFILE DROPDOWN */}
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-initial">{userInitial}</div>
                <div className="profile-details">
                  <p className="profile-name">{name}</p>
                  <p className="profile-email">{email}</p>
                </div>
              </div>
              <div className="profile-options">
                <button
                  className="profile-option-btn"
                  onClick={() => alert("Settings page coming soon!")}
                >
                  ⚙️ Settings
                </button>
                <button className="profile-option-btn" onClick={handleLogout}>
                  🚪 Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ===== MAIN BODY ===== */}
      <main className="reviews-body">
        <div className="reviews-header-section">
          <h2>Past Reviews</h2>
          <button
            className="new-review-btn"
            onClick={() => navigate("/upload")}
          >
            ✨ New Contract Review
          </button>
        </div>

        <div className="table-wrapper">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>AI Insights</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{r.aiInsights || "—"}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(r.id)}
                        title="Delete Review"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No past reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="reviews-footer">
        <p>© 2025 Legalyze. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default ReviewsPage;
