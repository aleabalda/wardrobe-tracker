const mysql = require("mysql2");
require("dotenv").config();
const dbuser = process.env.DB_USER ?? "dbuser";
const dbpassword = process.env.DB_PASSWORD ?? "s3kreee7";
const dbname = process.env.DB_NAME ?? "my_db";
const dbport = process.env.DB_PORT ?? 3306;

const connection = mysql.createConnection({
  host: "localhost",
  user: dbuser,
  password: dbpassword,
  database: dbname,
});

connection.connect((err: any) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

connection.query("SELECT 1 + 1 AS solution", (err: any, rows: any) => {
  if (err) {
    console.error("❌ Query failed:", err.message);
    return;
  }

  console.log("✅ Query result:", rows[0].solution);
});

connection.end();
