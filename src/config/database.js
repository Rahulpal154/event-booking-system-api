const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.DATABASE_URL);

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