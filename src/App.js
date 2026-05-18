import "./App.css";

import { useState } from "react";
import axios from "axios";

import ViewProducts from "./ViewProducts";
import CreateBills from "./CreateBills";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import AddProduct from "./AddProduct";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {

    const response = await axios.post(
      "http://localhost:5000/login",
      {
        username: username,
        password: password,
      }
    );

    console.log(response.data);

    if (response.data.length > 0) {

      localStorage.setItem("username", username);

      navigate("/dashboard", {
        state: {
          username: username,
        },
      });

    } else {

      alert("Invalid Credentials");

    }

  } catch (error) {

    console.log(error);

    alert("Server Error");

  }
};

  const register = async () => {
    const response = await axios.post(
      "https://billing-software-production-dc60.up.railway.app/register",
      {
        username: username,
        password: password,
      },
    );

    alert(response.data);
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

        <button onClick={handleLogin} className="login-button">
          Login
        </button>

        <button onClick={register} className="register-button">
          Register
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
