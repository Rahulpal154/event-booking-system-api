const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

// Railway provides MYSQL_URL as a full connection string
if (process.env.MYSQL_URL) {
  pool = mysql.createPool(process.env.MYSQL_URL + "?connectionLimit=10");
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "event_booking_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully.");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };