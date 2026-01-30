import express from "express";
import routes from "./routes";
import { pool } from "./db/pool";

const app = express();

app.use(express.json());

app.use("/api", routes);

app.get("/health/db", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "down" });
  }
});

app.get("/db-check", async (_req, res) => {
  try {
    const [rows]: any = await pool.query(`
      DESCRIBE users;
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

export default app;
