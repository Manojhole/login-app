const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* Register */
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).send(err);

    res.send({ message: "User registered!" });
  });
});

/* Login */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) {
      return res.status(401).send("Invalid credentials");
    }

    res.send({ message: "Login successful!" });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});