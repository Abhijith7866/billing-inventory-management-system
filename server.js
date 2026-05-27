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

    const [results] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (results.length === 0) {
      return res.status(401).json({
        error: "Wrong username or password",
      });
    }

    const user = results[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        error: "Wrong username or password",
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
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

/* REGISTER */

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users(username, password) VALUES (?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).send("Error");
      }

      res.send("User Registered");
    });
  } catch (err) {
    res.status(500).send("Error");
  }
});

/* ADD PRODUCT */

app.post("/add-product", (req, res) => {
  const { product_name, category, price, quantity } = req.body;

  const sql = `
  
    INSERT INTO products
    (
      product_name,
      category,
      price,
      quantity
    )
    
    VALUES (?, ?, ?, ?)
  
  `;

  db.query(sql, [product_name, category, price, quantity], (err, result) => {
    if (err) {
      return res.send("Error");
    }

    res.send("Product Added");
  });
});

/* GET PRODUCTS */

app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      return res.send(err);
    }

    res.send(result);
  });
});

/* DELETE PRODUCT */

app.delete("/delete-product/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM products WHERE id=?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.send("Error");
    }

    res.send("Product Deleted");
  });
});

/* UPDATE PRODUCT */

app.put("/update-product/:id", (req, res) => {
  const id = req.params.id;

  const { product_name, category, price, quantity } = req.body;

  const sql = `
  
    UPDATE products
    
    SET
      product_name=?,
      category=?,
      price=?,
      quantity=?
    
    WHERE id=?
  
  `;

  db.query(
    sql,
    [product_name, category, price, quantity, id],
    (err, result) => {
      if (err) {
        return res.send("Error");
      }

      res.send("Product Updated");
    },
  );
});

/* UPDATE STOCK */

app.put("/update-stock/:id", (req, res) => {
  const id = req.params.id;

  const quantity = req.body.quantity;

  const sql = "UPDATE products SET quantity = quantity - ? WHERE id=?";

  db.query(sql, [quantity, id], (err, result) => {
    if (err) {
      return res.send("Error");
    }

    res.send("Stock Updated");
  });
});

/* RESTORE STOCK */

app.put("/restore-stock/:id", (req, res) => {
  const id = req.params.id;

  const quantity = req.body.quantity;

  const sql = "UPDATE products SET quantity = quantity + ? WHERE id=?";

  db.query(sql, [quantity, id], (err, result) => {
    if (err) {
      return res.send("Error");
    }

    res.send("Stock Restored");
  });
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

  const billSql = `
  
    INSERT INTO bills
    (
      invoice_number,
      customer_name,
      customer_phone,
      final_total,
      bill_date
    )
    
    VALUES (?, ?, ?, ?, ?)
  
  `;

  db.query(
    billSql,
    [invoiceNumber, customerName, customerPhone, finalTotal, billDate],
    (err, result) => {
      if (err) {
        return res.send(err);
      }

      const billId = result.insertId;

      items.forEach((item) => {
        const itemSql = `
        
          INSERT INTO bill_items
          (
            bill_id,
            product_name,
            category,
            price,
            quantity,
            total
          )
          
          VALUES (?, ?, ?, ?, ?, ?)
        
        `;

        db.query(itemSql, [
          billId,
          item.product_name,
          item.category,
          item.price,
          item.billQuantity,
          item.total,
        ]);
      });

      res.send("Bill Saved");
    },
  );
});

/* GET BILLS */

app.get("/bills", (req, res) => {
  const sql = "SELECT * FROM bills ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.send(err);
    }

    res.send(result);
  });
});

/* CATEGORY ANALYTICS */

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

/* MONTHLY SALES */

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
      return res.status(500).json({
        message: "Database Error",
      });
    }

    res.json(result);
  });
});

/* TOP PRODUCTS */

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
      return res.status(500).json({
        message: "Database Error",
      });
    }

    res.json(result);
  });
});

/* BILL DETAILS */

app.get("/bill-details/:id", (req, res) => {
  const id = req.params.id;

  const billSql = "SELECT * FROM bills WHERE id=?";

  db.query(billSql, [id], (err, billResult) => {
    if (err) {
      return res.status(500).json({
        message: "Database Error",
      });
    }

    const itemSql = "SELECT * FROM bill_items WHERE bill_id=?";

    db.query(itemSql, [id], (err, itemResult) => {
      if (err) {
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

/* AI REORDER RECOMMENDATIONS */

app.get("/reorder-recommendations/:phone", (req, res) => {
  const phone = req.params.phone;

  const sql = `
  
    SELECT
      bill_items.product_name,
      bill_items.category,
      bill_items.price,
      bill_items.quantity,
      bills.bill_date
    
    FROM bill_items
    
    JOIN bills
    ON bill_items.bill_id = bills.id
    
    WHERE bills.customer_phone = ?
    
    ORDER BY bills.bill_date DESC
    
    LIMIT 5
  
  `;

  db.query(sql, [phone], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database Error",
      });
    }

    const recommendations = result.map((item) => {
      let reason = "";

      if (item.quantity >= 5) {
        reason = "You purchased a large quantity recently.";
      } else {
        reason = "Previously purchased item recommended.";
      }

      return {
        ...item,
        reason,
      };
    });

    res.json(recommendations);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Started on ${PORT}`);
});
