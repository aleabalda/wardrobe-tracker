import { Router } from "express";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

router.post("/create", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const { name, description, clothingItemIds } = req.body;

  if (
    !Array.isArray(clothingItemIds) ||
    clothingItemIds.length === 0 ||
    !clothingItemIds.every((id) => Number.isInteger(id) && id > 0)
  ) {
    return res.status(400).json({
      message: "An outfit needs at least one clothing item.",
    });
  }

  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ message: "Invalid outfit name." });
  }

  if (typeof name === "string" && name.trim().length > 100) {
    return res.status(400).json({
      message: "Outfit name must be 100 characters or fewer.",
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ message: "Invalid outfit description." });
  }

  // ignore duplicate ids so the composite primary key isn't violated
  const itemIds: number[] = [...new Set<number>(clothingItemIds)];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ownedRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id
      FROM clothing_items
      WHERE user_id = ? AND id IN (?)
      `,
      [userId, itemIds],
    );

    if (ownedRows.length !== itemIds.length) {
      await connection.rollback();

      return res.status(403).json({
        message: "You can only add your own clothing items to an outfit.",
      });
    }

    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO outfits
        (user_id, name, description)
      VALUES (?, ?, ?)
      `,
      [userId, name?.trim() || null, description?.trim() || null],
    );

    const outfitId = result.insertId;

    await connection.query(
      `
      INSERT INTO outfit_items
        (outfit_id, clothing_item_id)
      VALUES ?
      `,
      [itemIds.map((itemId) => [outfitId, itemId])],
    );

    await connection.commit();

    return res.status(201).json({
      id: outfitId,
      message: "Outfit created successfully.",
    });
  } catch (err) {
    await connection.rollback();

    console.error(err);

    return res.status(500).json({
      message: "Failed to create outfit.",
    });
  } finally {
    connection.release();
  }
});

export default router;
