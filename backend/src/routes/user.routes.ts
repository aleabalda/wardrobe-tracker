import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";

const router = Router();

interface UserDetailsRow extends RowDataPacket {
  id: number;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
}

router.get("/fetch", verifyToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [rows] = await pool.query<UserDetailsRow[]>(
      `
      SELECT
        id,
        email,
        username,
        first_name,
        last_name,
        phone_number
      FROM users
      WHERE id = ?
      `,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch user details.",
    });
  }
});

export default router;
