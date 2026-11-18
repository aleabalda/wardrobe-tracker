// src/db/pool.ts
import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  // MySQL stores BOOLEAN as TINYINT(1) and hands back 0/1; send true/false
  // instead so `flag && <jsx>` can't render a stray 0 on the frontend.
  // Every TINYINT in the schema is a BOOLEAN, so this catches only flags
  typeCast: (field, next) => {
    if (field.type === "TINY" && field.length === 1) {
      const value = field.string();
      return value === null ? null : value === "1";
    }
    return next();
  },
});
