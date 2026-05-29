require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("Database Pool Connected");

/* LOGIN */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Wrong username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* REGISTER */

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username,
        hashedPassword,
      ]);

    res.send("User Registered");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ADD PRODUCT */

app.post("/add-product", async (req, res) => {
  try {
    const { product_name, category, price, quantity } = req.body;

    if (!product_name || !category || price == null || quantity == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO products (product_name, category, price, quantity) VALUES (?, ?, ?, ?)`;
    await db.promise().query(sql, [product_name, category, price, quantity]);

    res.send("Product Added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* GET PRODUCTS */

app.get("/products", async (req, res) => {
  try {
    const [result] = await db.promise().query("SELECT * FROM products");
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* DELETE PRODUCT */

app.delete("/delete-product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.promise().query("DELETE FROM products WHERE id=?", [id]);
    res.send("Product Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* UPDATE PRODUCT */

app.put("/update-product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { product_name, category, price, quantity } = req.body;

    const sql = `UPDATE products SET product_name=?, category=?, price=?, quantity=? WHERE id=?`;
    await db.promise().query(sql, [product_name, category, price, quantity, id]);

    res.send("Product Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* UPDATE STOCK */

app.put("/update-stock/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const quantity = req.body.quantity;

    await db
      .promise()
      .query("UPDATE products SET quantity = quantity - ? WHERE id=?", [
        quantity,
        id,
      ]);

    res.send("Stock Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* RESTORE STOCK */

app.put("/restore-stock/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const quantity = req.body.quantity;

    await db
      .promise()
      .query("UPDATE products SET quantity = quantity + ? WHERE id=?", [
        quantity,
        id,
      ]);

    res.send("Stock Restored");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* SAVE BILL */

app.post("/save-bill", async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      customerPhone,
      finalTotal,
      billDate,
      items,
    } = req.body;

    const billSql = `INSERT INTO bills (invoice_number, customer_name, customer_phone, final_total, bill_date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db
      .promise()
      .query(billSql, [
        invoiceNumber,
        customerName,
        customerPhone,
        finalTotal,
        billDate,
      ]);

    const billId = result.insertId;

    const itemSql = `INSERT INTO bill_items (bill_id, product_name, category, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)`;

    // ✅ All item inserts awaited — no silent failures
    await Promise.all(
      items.map((item) =>
        db
          .promise()
          .query(itemSql, [
            billId,
            item.product_name,
            item.category,
            item.price,
            item.billQuantity,
            item.total,
          ])
      )
    );

    res.send("Bill Saved");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving bill");
  }
});

/* GET BILLS */

app.get("/bills", async (req, res) => {
  try {
    const [result] = await db
      .promise()
      .query("SELECT * FROM bills ORDER BY id DESC");
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* CATEGORY ANALYTICS */

app.get("/category-analytics", async (req, res) => {
  try {
    const sql = `SELECT category, COUNT(*) AS total FROM products GROUP BY category`;
    const [result] = await db.promise().query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* MONTHLY SALES */

app.get("/monthly-sales", async (req, res) => {
  try {
    const sql = `
      SELECT
        DATE_FORMAT(bill_date, '%b') AS month,
        SUM(final_total) AS revenue
      FROM bills
      GROUP BY MONTH(bill_date), month
      ORDER BY MONTH(bill_date)
    `;
    const [result] = await db.promise().query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* TOP PRODUCTS */

app.get("/top-products", async (req, res) => {
  try {
    const sql = `
      SELECT
        product_name,
        SUM(quantity) AS totalSold
      FROM bill_items
      GROUP BY product_name
      ORDER BY totalSold DESC
      LIMIT 5
    `;
    const [result] = await db.promise().query(sql);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* BILL DETAILS */

app.get("/bill-details/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const [billResult] = await db
      .promise()
      .query("SELECT * FROM bills WHERE id=?", [id]);

    const [itemResult] = await db
      .promise()
      .query("SELECT * FROM bill_items WHERE bill_id=?", [id]);

    res.json({ bill: billResult[0], items: itemResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

/* AI REORDER RECOMMENDATIONS */

app.get("/reorder-recommendations/:phone", async (req, res) => {
  const phone = req.params.phone;

  try {
    const [bills] = await db
      .promise()
      .query(
        `SELECT customer_name FROM bills WHERE customer_phone = ? LIMIT 1`,
        [phone]
      );

    if (bills.length === 0) {
      return res.json({ isReturning: false, customer: null, suggestions: [] });
    }

    const [suggestions] = await db.promise().query(
      `SELECT
         bi.product_name,
         bi.category,
         bi.price,
         SUM(bi.quantity) AS total_bought,
         MAX(b.bill_date) AS last_bought
       FROM bill_items bi
       JOIN bills b ON bi.bill_id = b.id
       WHERE b.customer_phone = ?
       GROUP BY bi.product_name, bi.category, bi.price
       ORDER BY total_bought DESC, last_bought DESC
       LIMIT 5`,
      [phone]
    );

    res.json({
      isReturning: true,
      customer: { name: bills[0].customer_name, phone },
      suggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on ${PORT}`);
});