import { Router } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import "dotenv/config";
import bcrypt from "bcrypt";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const SALT_ROUNDS = 10;

interface UserRow extends RowDataPacket {
  id: number;
  password_hash: string;
}
interface ExistingUser extends RowDataPacket {
  id: number;
}
interface JwtPayload {
  userId: number;
}

const router = Router();

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  // Basic validation
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check for existing user
  const [existing] = await pool.query<ExistingUser[]>(
    `SELECT id FROM users WHERE email = ? OR username = ?`,
    [email, username],
  );

  if (existing.length > 0) {
    return res.status(409).json({
      error: "Email or username already in use",
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (email, username, password_hash)
     VALUES (?, ?, ?)`,
    [email, username, passwordHash],
  );

  res.status(201).json({
    message: "User registered successfully",
    userId: result.insertId,
  });
});

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Login route
router.post("/login", async (req, res) => {
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Logged in" });
});

// Logout route
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({ message: "Logged out" });
});

// Verify current user
router.get("/me", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    res.json({
      authenticated: true,
      userId: decoded.userId,
    });
  } catch {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
