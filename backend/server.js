// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ─── DATABASE CONNECTION ──────────────────────────────────────────────
db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ─── HOME ROUTE ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Billing Software Backend Running Successfully 🚀");
});

// ─── REGISTER ─────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "Registration failed",
        });
      }

      res.json({
        message: "User registered successfully",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: "Database error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        error: "Invalid username",
      });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET || "secretkey",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  });
});

// ─── ADD PRODUCT ──────────────────────────────────────────────────────
app.post("/add-product", (req, res) => {
  const {
    product_name,
    category,
    price,
    quantity,
  } = req.body;

  const sql =
    "INSERT INTO products(product_name, category, price, quantity) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [product_name, category, price, quantity],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "Failed to add product",
        });
      }

      res.json({
        message: "Product added successfully",
      });
    }
  );
});

// ─── VIEW PRODUCTS ────────────────────────────────────────────────────
app.get("/view-products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: "Failed to fetch products",
      });
    }

    res.json(result);
  });
});

// ─── SERVER START ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server Started on port ${PORT}`);
});