import { Router } from "express";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

router.post("/create", verifyToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user!.id;
    const { clothingItemId, price, status = "active" } = req.body;

    if (!clothingItemId || price == null) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    const [rows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id
      FROM clothing_items
      WHERE id = ? AND user_id = ?
      `,
      [clothingItemId, userId],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(403).json({
        message: "You do not own this clothing item.",
      });
    }

    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO listings
        (clothing_item_id, seller_id, price, status)
      VALUES (?, ?, ?, ?)
      `,
      [clothingItemId, userId, price, status],
    );

    await connection.query(
      `
      UPDATE clothing_items
      SET is_for_sale = 1
      WHERE id = ?
      `,
      [clothingItemId],
    );

    await connection.commit();

    return res.status(201).json({
      id: result.insertId,
      message: "Listing created successfully.",
    });
  } catch (err) {
    await connection.rollback();

    console.error(err);

    return res.status(500).json({
      message: "Failed to create listing.",
    });
  } finally {
    connection.release();
  }
});

router.get("/get", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("about to fetch listings");
    const [rows] = await pool.execute(
      "SELECT listings.*, clothing_items.name, clothing_items.description, clothing_items.brand, clothing_items.type, clothing_items.color, clothing_items.size, clothing_items.image_url FROM listings JOIN clothing_items ON listings.clothing_item_id = clothing_items.id;",
      [userId],
    );
    console.log("fetched listings");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch listings",
    });
  }
});

export default router;
