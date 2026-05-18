// server.js
require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const cors = require("cors");

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
// ✅ Express 5 compatible

app.use(express.json());

// ─── DB Connect ───────────────────────────────────────────────────────────────
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "API Working" });
});

// ─── Register ─────────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ Register error:", err.message);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: "Registration failed" });
      }
      res.status(201).json({ message: "Registration successful" });
    });
  } catch (err) {
    console.error("❌ Register crash:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error("❌ Login DB error:", err.message);
        return res.status(500).json({ error: "Login failed" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const user = results[0];

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username },
      });
    });
  } catch (err) {
    console.error("❌ Login crash:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Add Product ──────────────────────────────────────────────────────────────
app.post("/add-product", (req, res) => {
  const { product_name, category, price, quantity } = req.body;

  if (!product_name || !category || !price || !quantity) {
    return res.status(400).json({ error: "All product fields are required" });
  }

  const sql =
    "INSERT INTO products (product_name, category, price, quantity) VALUES (?,?,?,?)";

  db.query(sql, [product_name, category, price, quantity], (err, result) => {
    if (err) {
      console.error("❌ Add product error:", err.message);
      return res.status(500).json({ error: "Failed to add product" });
    }
    res.status(201).json({ message: "Product added successfully" });
  });
});

// ─── View Products ────────────────────────────────────────────────────────────
app.get("/view-products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("❌ View products error:", err.message);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(results);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server Started on port ${PORT}`);
});
