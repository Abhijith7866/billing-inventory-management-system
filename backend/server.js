const express = require("express");

const cors = require("cors");

const app = express();

/* MIDDLEWARES */
app.use(cors());
const cors = require("cors");

app.use(
  cors({
    origin: "https://billing-software-blgdmah9q-abhijith7866s-projects.vercel.app/",
    credentials: true
  })
);
app.use(express.json());

/* DATABASE CONNECTION */
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});
/* LOGIN */
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql =
        "SELECT * FROM users WHERE username=? AND password=?";

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send("Invalid Credentials");
            }
        }
    });
});

/* REGISTER */
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql =
        "INSERT INTO users(username, password) VALUES (?, ?)";

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.send("Error");
        } else {
            res.send("User Registered");
        }
    });
});

/* ADD PRODUCT */
app.post("/add-product", (req, res) => {
    const {
        product_name,
        category,
        price,
        quantity,
    } = req.body;

    const sql = `
        INSERT INTO products
        (product_name, category, price, quantity)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            product_name,
            category,
            price,
            quantity,
        ],
        (err, result) => {
            if (err) {
                res.send("Error");
            } else {
                res.send("Product Added");
            }
        }
    );
});

/* VIEW PRODUCTS */
app.get("/products", (req, res) => {
    const sql = "SELECT * FROM products";

    db.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});

/* DELETE PRODUCT */
app.delete("/delete-product/:id", (req, res) => {
    const id = req.params.id;

    const sql =
        "DELETE FROM products WHERE id=?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            res.send("Error");
        } else {
            res.send("Product Deleted");
        }
    });
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
        [
            product_name,
            category,
            price,
            quantity,
            id,
        ],
        (err, result) => {
            if (err) {
                res.send("Error");
            } else {
                res.send("Product Updated");
            }
        }
    );
});

/* UPDATE STOCK */
app.put("/update-stock/:id", (req, res) => {
    const id = req.params.id;
    const quantity = req.body.quantity;

    const sql =
        "UPDATE products SET quantity = quantity - ? WHERE id=?";

    db.query(sql, [quantity, id], (err, result) => {
        if (err) {
            res.send("Error");
        } else {
            res.send("Stock Updated");
        }
    });
});

/* RESTORE STOCK */
app.put("/restore-stock/:id", (req, res) => {
    const id = req.params.id;
    const quantity = req.body.quantity;

    const sql =
        "UPDATE products SET quantity = quantity + ? WHERE id=?";

    db.query(sql, [quantity, id], (err, result) => {
        if (err) {
            res.send("Error");
        } else {
            res.send("Stock Restored");
        }
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

    /* INSERT INTO bills TABLE */
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
        [
            invoiceNumber,
            customerName,
            customerPhone,
            finalTotal,
            billDate,
        ],
        (err, result) => {
            if (err) {
                res.send(err);
            } else {
                /* GET INSERTED BILL ID */
                const billId = result.insertId;

                /* SAVE BILL ITEMS */
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
            }
        }
    );
});

/* GET ALL BILLS */
app.get("/bills", (req, res) => {
    const sql =
        "SELECT * FROM bills ORDER BY id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});
app.get("/", (req, res) => {
  res.send("Billing Software Backend Running Successfully 🚀");
});
/* SERVER */
app.listen(5000, () => {
    console.log("Server Started");
});