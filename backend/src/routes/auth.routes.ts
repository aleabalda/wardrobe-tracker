import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { RowDataPacket } from "mysql2";
import "dotenv/config";

interface UserRow extends RowDataPacket {
  id: number;
  password_hash: string;
}

const SALT_ROUNDS = 10;

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await pool.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [
    email,
    passwordHash,
  ]);

  res.status(201).json({ message: "User created" });
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email],
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.json({ message: "Logged in" });
});

export default router;
