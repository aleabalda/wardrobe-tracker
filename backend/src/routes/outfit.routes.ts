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

    // the id is only known after insert, so unnamed outfits get named here
    if (!name?.trim()) {
      const date = new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

      await connection.query(
        `
        UPDATE outfits
        SET name = ?
        WHERE id = ?
        `,
        [`Outfit ${outfitId} ${date}`, outfitId],
      );
    }

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

router.get("/get", verifyToken, async (req, res) => {
  const userId = req.user!.id;

  try {
    const [outfitRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id, name, description, is_favourite, created_at
      FROM outfits
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );

    if (outfitRows.length === 0) {
      return res.status(200).json([]);
    }

    const [itemRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT oi.outfit_id, ci.*
      FROM outfit_items oi
      JOIN clothing_items ci ON ci.id = oi.clothing_item_id
      WHERE oi.outfit_id IN (?)
      `,
      [outfitRows.map((outfit) => outfit.id)],
    );

    // group each outfit's clothing items under it
    const outfits = outfitRows.map((outfit) => ({
      ...outfit,
      items: itemRows
        .filter((item) => item.outfit_id === outfit.id)
        .map(({ outfit_id, image_public_id, ...item }) => item),
    }));

    return res.status(200).json(outfits);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch outfits.",
    });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const outfitId = Number(req.params.id);

  if (!Number.isInteger(outfitId) || outfitId <= 0) {
    return res.status(400).json({ message: "Invalid outfit id." });
  }

  try {
    // outfit_items rows are removed by ON DELETE CASCADE
    const [result] = await pool.query<ResultSetHeader>(
      `
      DELETE FROM outfits
      WHERE id = ? AND user_id = ?
      `,
      [outfitId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Outfit not found." });
    }

    return res.status(200).json({ message: "Outfit deleted successfully." });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to delete outfit.",
    });
  }
});

router.put("/favourite/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const outfitId = Number(req.params.id);
  const { is_favourite } = req.body;

  if (!Number.isInteger(outfitId) || outfitId <= 0) {
    return res.status(400).json({ message: "Invalid outfit id." });
  }

  if (typeof is_favourite !== "boolean") {
    return res.status(400).json({ message: "is_favourite must be a boolean." });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE outfits
      SET is_favourite = ?
      WHERE id = ? AND user_id = ?
      `,
      [is_favourite, outfitId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Outfit not found." });
    }

    return res.status(200).json({
      message: "Favourite updated successfully.",
      is_favourite,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to update favourite.",
    });
  }
});

export default router;
