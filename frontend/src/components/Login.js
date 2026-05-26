import { useState } from "react";

import axios from "axios";

import { useNavigate, Link } from "react-router-dom";

import { toast } from "react-toastify";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const API = "https://billing-backend-sigma.vercel.app";

  const handleLogin = async () => {
    // EMPTY FIELD CHECK

    if (!username.trim()) {
      toast.warning("Username is required ⚠");

      return;
    }

    if (!password.trim()) {
      toast.warning("Password is required ⚠");

      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/login`,

        {
          username,
          password,
        },
      );

      console.log("Login response:", res.data);

      const token = res.data.token;

      const userName = res.data.user?.username || res.data.username || username;

      if (token) {
        localStorage.setItem("token", token);

        localStorage.setItem("username", userName);

        // SUCCESS TOAST

        toast.success("Login Successful ✅");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        toast.error("Login Failed ❌");
      }
    } catch (err) {
      console.log("Login error:", err.response);

      if (!err.response) {
        toast.error("Backend Server Not Running ❌");
      } else if (err.response.status === 401) {
        toast.error("Invalid Credentials ❌");
      } else if (err.response.status === 500) {
        toast.error("Server Error ❌");
      } else {
        toast.error("Login Failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="overlay"></div>

        <div className="login-content">
          <h1>Billing Software</h1>

          <p>
            Smart inventory and billing management system for modern businesses.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back 👋</h2>

          <p className="subtitle">Login to continue</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="login-input"
          />

          <button
            onClick={handleLogin}
            className="login-button"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Login"}
          </button>

          <p className="bottom-text">
            Don't have an account?
            <Link to="/register" className="register-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
