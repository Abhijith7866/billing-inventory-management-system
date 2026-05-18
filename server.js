require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

// Debug: confirm env vars are loaded
console.log("✅ ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);
console.log("✅ JWT_SECRET set:", !!process.env.JWT_SECRET);

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((o) => o.trim());

      // Allow requests with no origin (e.g. Postman, curl, Railway health checks)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked for origin:", origin);
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// DB Connection
// ✅ Test connection without calling .connect()
db.query("SELECT 1", (err) => {
  if (err) {
    console.log("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// Home Route
app.get("/", (req, res) => {
  res.send("Billing Software Backend Running Successfully 🚀");
});

// Register Route
app.post("/register", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.log("❌ Register Error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: "Username already exists",
          });
        }

        return res.status(500).json({
          error: "Registration failed",
        });
      }

      res.status(201).json({
        message: "User Registered Successfully",
      });
    });
  } catch (err) {
    console.log("❌ Register Crash:", err);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.log("❌ Login DB Error:", err);

      return res.status(500).json({
        error: "Database Error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  });
});

// Add Product
app.post("/add-product", (req, res) => {
  const { product_name, category, price, quantity } = req.body;

  if (!product_name || !category || !price || !quantity) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  const sql =
    "INSERT INTO products (product_name, category, price, quantity) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [product_name, category, price, quantity],
    (err, result) => {
      if (err) {
        console.log("❌ Add Product Error:", err);

        return res.status(500).json({
          error: "Failed to add product",
        });
      }

      res.status(201).json({
        message: "Product added successfully",
      });
    }
  );
});

// View Products
app.get("/view-products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("❌ View Products Error:", err);

      return res.status(500).json({
        error: "Failed to fetch products",
      });
    }

    res.json(result);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server Started on port ${PORT}`);
});