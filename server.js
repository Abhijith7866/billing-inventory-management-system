require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true
}));

app.use(express.json());

// DB Connect
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// Health Check
app.get("/", (req, res) => {
  res.send("Billing Software Backend Running Successfully 🚀");
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json("User Registered Successfully");
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
app.post("/login", (req, res) => {

  const sql =
    "SELECT * FROM users WHERE username = ?";

  db.query(sql, [req.body.username], async (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(401).json("User not found");
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      result[0].password
    );

    if (!validPassword) {
      return res.status(401).json("Wrong password");
    }

    const token = jwt.sign(
      { id: result[0].id },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      username: result[0].username
    });

  });
});

// Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server Started on port ${PORT}`);
});