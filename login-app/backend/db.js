const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Manoj@123",
  database: process.env.DB_NAME || "login_app"
});

db.connect(err => {
  if (err) {
    console.error("DB error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;