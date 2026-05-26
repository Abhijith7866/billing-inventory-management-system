import { useState } from "react";

import axios from "axios";

import { useNavigate, Link } from "react-router-dom";

import { toast } from "react-toastify";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const API = "https://billing-backend-sigma.vercel.app";

  const handleRegister = async () => {
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

      await axios.post(
        `${API}/register`,

        {
          username,
          password,
        },
      );

      // SUCCESS TOAST

      toast.success("Registration Successful 🎉");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.log("Register Error:", err.response);

      // USER ALREADY EXISTS

      if (err.response?.status === 409) {
        toast.error("Username already exists ❌");
      }

      // SERVER ERROR
      else if (err.response?.status === 500) {
        toast.error("Server Error ❌");
      }

      // OTHER ERRORS
      else {
        toast.error(err.response?.data?.error || "Registration Failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="overlay"></div>

        <div className="register-content">
          <h1>Join Us 🚀</h1>

          <p>
            Create your account and manage your billing system smarter and
            faster.
          </p>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2>Create Account</h2>

          <p className="subtitle">Register to continue</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            className="register-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            className="register-input"
          />

          <button
            onClick={handleRegister}
            className="register-button"
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : "Register"}
          </button>

          <p className="bottom-text">
            Already have an account?
            <Link to="/" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
