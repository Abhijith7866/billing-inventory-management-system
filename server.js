require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const fetch = require("node-fetch");

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://billing-frontend-rho-amber.vercel.app'],
  credentials: true
}));

app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // ← add this
  waitForConnections: true,
  connectionLimit: 10,
});
// db.connect((err) => {
//   if (err) {
//     console.log("Database Connection Failed");
//     console.log(err);
//   } else {
//     console.log("Database Connected");
//   }
// });

/* LOGIN */

// ✅ NEW — returns token properly
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
        console.log("❌ Login DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // ✅ User not found
      if (results.length === 0) {
        return res.status(401).json({ error: "Wrong username or password" });
      }

      const user = results[0];

      // ✅ Check password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ error: "Wrong username or password" });
      }

      // ✅ Create token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || "secret123",
        { expiresIn: "7d" },
      );

      // ✅ Send token back
      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    });
  } catch (err) {
    console.log("❌ Login crash:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* REGISTER */

app.post("/register", async (req, res) => {
  const username = req.body.username;

  const password = req.body.password;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users(username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);

        res.status(500).send("Error");
      } else {
        res.send("User Registered");
      }
    });
  } catch (err) {
    console.log(err);

    res.status(500).send("Error");
  }
});

/* ADD PRODUCT */

app.post("/add-product", (req, res) => {
  const {
    product_name,

    category,

    price,

    quantity,
  } = req.body;

  const sql = `INSERT INTO products
    (
        product_name,
        category,
        price,
        quantity
    )
    VALUES (?, ?, ?, ?)`;

  db.query(
    sql,

    [product_name, category, price, quantity],

    (err, result) => {
      if (err) {
        res.send("Error");
      } else {
        res.send("Product Added");
      }
    },
  );
});

/* GET PRODUCTS */

app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
/* DELETE PRODUCT */

app.delete("/delete-product/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM products WHERE id=?";

  db.query(
    sql,

    [id],

    (err, result) => {
      if (err) {
        res.send("Error");
      } else {
        res.send("Product Deleted");
      }
    },
  );
});

/* UPDATE PRODUCT */

app.put("/update-product/:id", (req, res) => {
  const id = req.params.id;

  const {
    product_name,

    category,

    price,

    quantity,
  } = req.body;

  const sql = `UPDATE products
    SET
    product_name=?,
    category=?,
    price=?,
    quantity=?
    WHERE id=?`;

  db.query(
    sql,

    [product_name, category, price, quantity, id],

    (err, result) => {
      if (err) {
        res.send("Error");
      } else {
        res.send("Product Updated");
      }
    },
  );
});

/* UPDATE STOCK */

app.put("/update-stock/:id", (req, res) => {
  const id = req.params.id;

  const quantity = req.body.quantity;

  const sql = "UPDATE products SET quantity = quantity - ? WHERE id=?";

  db.query(
    sql,

    [quantity, id],

    (err, result) => {
      if (err) {
        res.send("Error");
      } else {
        res.send("Stock Updated");
      }
    },
  );
});

/* RESTORE STOCK */

app.put("/restore-stock/:id", (req, res) => {
  const id = req.params.id;

  const quantity = req.body.quantity;

  const sql = "UPDATE products SET quantity = quantity + ? WHERE id=?";

  db.query(
    sql,

    [quantity, id],

    (err, result) => {
      if (err) {
        res.send("Error");
      } else {
        res.send("Stock Restored");
      }
    },
  );
});

/* SAVE BILL */

app.post("/save-bill", (req, res) => {
  const {
    invoiceNumber,

    customerName,

    customerPhone,

    finalTotal,

    billDate,

    items,
  } = req.body;

  // INSERT BILL

  const billSql = `INSERT INTO bills
    (
        invoice_number,
        customer_name,
        customer_phone,
        final_total,
        bill_date
    )
    VALUES (?, ?, ?, ?, ?)`;

  db.query(
    billSql,

    [invoiceNumber, customerName, customerPhone, finalTotal, billDate],

    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        // GET BILL ID

        const billId = result.insertId;

        // SAVE ITEMS

        items.forEach((item) => {
          const itemSql = `INSERT INTO bill_items
                    (
                        bill_id,
                        product_name,
                        category,
                        price,
                        quantity,
                        total
                    )
                    VALUES (?, ?, ?, ?, ?, ?)`;

          db.query(
            itemSql,

            [
              billId,

              item.product_name,

              item.category,

              item.price,

              item.billQuantity,

              item.total,
            ],
          );
        });

        res.send("Bill Saved");
      }
    },
  );
});

/* GET BILLS */

app.get("/bills", (req, res) => {
  const sql = "SELECT * FROM bills ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
// =====================================
// CATEGORY ANALYTICS
// =====================================

app.get("/category-analytics", (req, res) => {
  const sql = `
    SELECT
      category,
      COUNT(*) AS total
    FROM products
    GROUP BY category
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// =====================================
// MONTHLY SALES ANALYTICS
// =====================================

app.get("/monthly-sales", (req, res) => {
  const sql = `

    SELECT
      DATE_FORMAT(bill_date, '%b') AS month,
      SUM(final_total) AS revenue

    FROM bills

    GROUP BY MONTH(bill_date), month

    ORDER BY MONTH(bill_date)

  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Database Error",
      });
    }

    res.json(result);
  });
});

// =====================================
// TOP SELLING PRODUCTS
// =====================================

// =====================================
// TOP SELLING PRODUCTS
// =====================================

app.get("/top-products", (req, res) => {
  const sql = `

    SELECT
      product_name,
      SUM(quantity) AS totalSold

    FROM bill_items

    GROUP BY product_name

    ORDER BY totalSold DESC

    LIMIT 5

  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("TOP PRODUCTS ERROR:", err);

      return res.status(500).json({
        message: "Database Error",
      });
    }

    res.json(result);
  });
});
// ======================================
// BILL DETAILS
// ======================================

app.get("/bill-details/:id", (req, res) => {
  const id = req.params.id;

  const billSql = `
  
    SELECT * FROM bills
  
    WHERE id = ?
  
  `;

  db.query(billSql, [id], (err, billResult) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Database Error",
      });
    }

    const itemSql = `
    
      SELECT * FROM bill_items
    
      WHERE bill_id = ?
    
    `;

    db.query(itemSql, [id], (err, itemResult) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database Error",
        });
      }

      res.json({
        bill: billResult[0],

        items: itemResult,
      });
    });
  });
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// AI Reorder Recommendation
app.get("/api/recommendations/:phone", async (req, res) => {
  const { phone } = req.params;

  try {
    db.query(
      `SELECT b.invoice_number, b.bill_date, b.final_total,
              bi.product_name, bi.category, bi.quantity, bi.price
       FROM bills b
       JOIN bill_items bi ON b.id = bi.bill_id
       WHERE b.customer_phone = ?
       ORDER BY b.bill_date DESC
       LIMIT 20`,
      [phone],
      async (err, bills) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        console.log("Phone:", phone);
        console.log("Bills found:", bills.length);

        if (bills.length === 0) {
          return res.json({ isNewCustomer: true, recommendations: [] });
        }

        console.log('GROQ KEY:', process.env.GROQ_API_KEY);

        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a smart billing assistant. Reply ONLY in valid JSON, no extra text.",
                  },
                  {
                    role: "user",
                    content: `Based on this customer's purchase history, suggest reorder recommendations.
            
Purchase History: ${JSON.stringify(bills)}

Reply ONLY in this JSON format:
{
  "customerName": "name from history",
  "message": "personalized greeting message",
  "recommendations": [
    {
      "product_name": "product name",
      "category": "category",
      "last_price": 00.00,
      "last_quantity": 0,
      "reason": "short reason why they should reorder"
    }
  ]
}`,
                  },
                ],
              }),
            },
          );

          const data = await response.json();
          console.log('Groq response:', JSON.stringify(data));
          const text = data.choices[0].message.content;
          const clean = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          res.json({ isNewCustomer: false, ...parsed });
        } catch (aiErr) {
          console.error(aiErr);
          res.status(500).json({ error: "AI error" });
        }
      },
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// ✅ Replace with this
// if (require.main === module) {
//   app.listen(3000);
// }
// module.exports = app;

if (require.main === module) {
  app.listen(5000, () => {
    console.log("Server running on port 3000");
  });
}
