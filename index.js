const path = require("path");
const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(express.json());

require("dotenv").config();

console.log("DB Config from .env:");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD);
console.log("DB Name:", process.env.DB_NAME);
console.log("Port:", process.env.DB_PORT);


// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to AWS RDS MySQL!");
});

// Example Route
app.get("/stations", (req, res) => {
  db.query("SELECT * FROM charging_stations", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/sessions", (req, res) => {
  const { station_id, start_time, end_time, units, rate_per_unit } = req.body;
  const revenue = units * rate_per_unit;

  const sql = `
    INSERT INTO charging_sessions 
    (station_id, start_time, end_time, units, rate_per_unit, revenue)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [station_id, start_time, end_time, units, rate_per_unit, revenue], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).send("Database insert failed");
    }
    res.send("Charging session logged successfully");
  });
});

app.use(express.static(path.join(__dirname, "../Public")));


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


