const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {

    if(err){
        console.log("Database connection failed:", err);
    }

    else{
        console.log("MySQL Connected");
    }

});

app.get("/", (req, res) => {
    res.send("API Working");
});

app.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const sql =
    "INSERT INTO users(username,password) VALUES (?,?)";

    db.query(
        sql,
        [username, password],
        (err, result) => {

            if(err){
                console.log(err);
                res.status(500).send("Registration Failed");
            }

            else{
                res.send("Registration Successful");
            }

        }
    );

});

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const sql =
    "SELECT * FROM users WHERE username=? AND password=?";

    db.query(
        sql,
        [username, password],
        (err, result) => {

            if(err){
                console.log(err);
                res.status(500).send("Login Failed");
            }

            else{
                res.send(result);
            }

        }
    );

});

app.post("/add-product", (req, res) => {

    const {
        product_name,
        category,
        price,
        quantity
    } = req.body;

    const sql =
    `INSERT INTO products
    (product_name, category, price, quantity)
    VALUES (?,?,?,?)`;

    db.query(
        sql,
        [product_name, category, price, quantity],
        (err, result) => {

            if(err){
                console.log(err);
                res.status(500).send("Failed to add product");
            }

            else{
                res.send("Product Added Successfully");
            }

        }
    );

});

app.get("/view-products", (req, res) => {

    db.query(
        "SELECT * FROM products",
        (err, result) => {

            if(err){
                console.log(err);
                res.status(500).send("Failed");
            }

            else{
                res.send(result);
            }

        }
    );

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server Started");
});