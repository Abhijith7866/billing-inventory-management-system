import "./App.css";
import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import AddProduct from "./AddProduct";
import ViewProducts from "./ViewProducts";
import CreateBills from "./CreateBills";

// ✅ One place to change the URL — never hardcode localhost
const API_URL = "https://billing-software-production-dc60.up.railway.app";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      console.log("Login response:", response.data);

      // ✅ New check — look for token in response
      if (response.data.token) {
        // ✅ Save token and username for later use
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.user.username);

        navigate("/dashboard", {
          state: { username: response.data.user.username },
        });
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.log("Login error:", error);

      // ✅ Show the actual error message from backend
      if (error.response) {
        alert(error.response.data.error || "Login failed");
      } else {
        alert("Cannot reach server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/register`, {
        username,
        password,
      });

      alert(response.data.message || "Registration successful");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.error || "Registration failed");
      } else {
        alert("Cannot reach server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Billing Software</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        <button
          onClick={handleLogin}
          className="login-button"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <button
          onClick={register}
          className="register-button"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Register"}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/view-products" element={<ViewProducts />} />
        <Route path="/create-bills" element={<CreateBills />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
