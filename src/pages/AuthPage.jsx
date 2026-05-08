import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthPage.css";


const AUTH_API = import.meta.env.VITE_AUTH_API;
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Effect to handle the state passed from HomePage
  useEffect(() => {
    if (location.state && location.state.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);


const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Submitting login...");
  console.log("AUTH_API =", AUTH_API);

  try {
    const res = await axios.post(
      `${AUTH_API}/api/auth/login`,
      {
        email: form.email,
        password: form.password,
      }
    );

    console.log("LOGIN RESPONSE:", res.data);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("name", res.data.name);
    localStorage.setItem("email", form.email);

    console.log("Navigating...");
    navigate("/workspace-choice");

  } catch (err) {
    console.error("LOGIN ERROR:", err.response?.data || err.message);
    alert("Login failed");
  }
};

  return (
    <div className="auth-container">
      <div className="auth-box">

        {/* Left Column (Form) */}
        <div className="auth-form">

          <div className="logo-title-row">
            <img src="/legal3.png" alt="logo" className="auth-logo" />
            <h2>{isLogin ? "Login" : "Create Account"}</h2>
          </div>

          <p className="subtitle">
            {isLogin
              ? "Access your account to manage your contracts."
              : "Join our community and streamline your legal contracts!"}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name*"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email*"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder={isLogin ? "Password*" : "Create Password*"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            {!isLogin && (
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="CLIENT">Client</option>
                <option value="LAWYER">Lawyer</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isLogin ? "Log In" : "Create Account"}
              </button>
            </div>

            <button type="button" className="btn-google">
              <span>G</span>{" "}
              {isLogin ? "Sign in with Google" : "Sign up with Google"}
            </button>
          </form>

          <p
            className="switch-auth"
            onClick={() => setIsLogin((prev) => !prev)}
          >
            {isLogin
              ? "New here? Create an account today."
              : "Already a member? Log In"}
          </p>

          <footer>© 2025 Legalyze</footer>
        </div>

        {/* Right Column (Testimonial) */}
        <div className="auth-testimonial">
          <div className="stars">★★★★★</div>

          <p className="quote">
            {isLogin
              ? `"Legalyze has made contract management effortless!"`
              : `"Legalyze has transformed our contract management process!"`}
          </p>

          <div className="user-info">
            <img src="/emily.png" alt="Emily Johnson" className="avatar-img" />
            <div>
              <strong>Emily Johnson</strong>
              <p>Managing Attorney, LawFirm</p>
            </div>
            <div className="company">Legalyze</div>
          </div>

          <div className="carousel-controls">
            <span>←</span>
            <span className="dot active">●</span>
            <span className="dot">●</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;