import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
import {
  DESCRIPTION_LIMIT,
  ITEM_FIELD_LIMITS,
  REQUIRED_ITEM_FIELDS,
  readTextFields,
} from "../utils/textFields";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

const upload = multer({
  dest: "uploads/", // temp storage
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/add", verifyToken, upload.single("image"), async (req, res) => {
  let uploadedImagePublicId: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, brand, type, color, size, price, description, isForSale } =
      req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `wardrobe/${userId}`,
    });

    uploadedImagePublicId = uploadResult.public_id;
    const imageUrl = uploadResult.secure_url;
    console.log(imageUrl);

    console.log([
      userId,
      name,
      brand,
      type,
      color,
      size,
      price ? Number(price) : null,
      description,
      uploadResult.secure_url,
      isForSale === "true" ? 1 : 0,
    ]);

    const [result] = await pool.execute(
      `
        INSERT INTO clothing_items (
          user_id,
          name,
          brand,
          type,
          color,
          size,
          price,
          description,
          image_url,
          image_public_id,
          is_for_sale
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        userId,
        name,
        brand || null,
        type,
        color || null,
        size || null,
        price ? Number(price) : null,
        description || null,
        imageUrl,
        uploadedImagePublicId,
        isForSale === "true" ? 1 : 0,
      ],
    );

    console.log("Database insert result:", result);
    const insertId = (result as ResultSetHeader).insertId;

    // the item is saved now, so its image must not be cleaned up on a later error
    uploadedImagePublicId = null;

    // return the saved row so the client has every field (defaults included)
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM clothing_items WHERE id = ?`,
      [insertId],
    );

    res.status(201).json(rows[0]);
    console.log("Clothing item created with ID:", insertId);
  } catch (err) {
    console.error(err);

    // delete uploaded image if DB insert fails
    if (uploadedImagePublicId) {
      await cloudinary.uploader.destroy(uploadedImagePublicId);
    }

    res.status(500).json({
      message: "Failed to create clothing item",
    });
  }
});

router.get("/get", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // optional ?favourite=true to only return favourited items, and
    // ?archived=true for past items (no longer owned) instead of current ones
    const favouritesOnly = req.query.favourite === "true";
    const archivedOnly = req.query.archived === "true";

    const [rows] = await pool.execute(
      `SELECT * FROM clothing_items
      WHERE user_id = ?
        AND archived_at IS ${archivedOnly ? "NOT NULL" : "NULL"}${
          favouritesOnly ? " AND is_favourite = 1" : ""
        }
      ORDER BY ${archivedOnly ? "archived_at DESC" : "created_at DESC"}`,
      [userId],
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch clothing items",
    });
  }
});

// one of the user's items with its latest listing's id and status, or null
const fetchOwnItem = async (itemId: string | number, userId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      ci.*,
      l.id AS listing_id,
      l.status AS listing_status,
      (
        SELECT COUNT(*)
        FROM outfit_items oi
        WHERE oi.clothing_item_id = ci.id
      ) AS outfit_count
    FROM clothing_items ci
    LEFT JOIN listings l ON l.id = (
      SELECT MAX(latest.id)
      FROM listings latest
      WHERE latest.clothing_item_id = ci.id
    )
    WHERE ci.id = ? AND ci.user_id = ?
    `,
    [itemId, userId],
  );

  return rows[0] ?? null;
};

router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const item = await fetchOwnItem(String(req.params.id), userId);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(item);
});

// edits an item's details; a listed item's status is edited via its listing
router.put("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const itemId = Number(req.params.id);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  const fields = readTextFields(
    req.body,
    { ...ITEM_FIELD_LIMITS, description: DESCRIPTION_LIMIT },
    REQUIRED_ITEM_FIELDS,
  );

  if (fields.error !== undefined) {
    return res.status(400).json({ message: fields.error });
  }

  const { values } = fields;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `
      UPDATE clothing_items
      SET name = ?, brand = ?, type = ?, color = ?, size = ?, description = ?
      WHERE id = ? AND user_id = ? AND archived_at IS NULL
      `,
      [
        values.name,
        values.brand,
        values.type,
        values.color,
        values.size,
        values.description,
        itemId,
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      const item = await fetchOwnItem(itemId, userId);
      return item
        ? res
            .status(409)
            .json({ message: "Restore this item to your wardrobe to edit it." })
        : res.status(404).json({ message: "Item not found." });
    }

    await connection.commit();

    return res.status(200).json(await fetchOwnItem(itemId, userId));
  } catch (err) {
    await connection.rollback();
    console.error(err);

    return res.status(500).json({ message: "Failed to update item." });
  } finally {
    connection.release();
  }
});

const ARCHIVE_REASONS = ["sold", "donated", "discarded", "other"] as const;
type ArchiveReason = (typeof ARCHIVE_REASONS)[number];

const parseItemId = (raw: unknown) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// moves an item to the user's past items: it leaves the wardrobe but stays in
// its outfits, and any listing still up for sale is taken down
router.put("/:id/archive", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const itemId = parseItemId(req.params.id);
  const reason = req.body?.reason as ArchiveReason;

  if (itemId === null) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  if (!ARCHIVE_REASONS.includes(reason)) {
    return res.status(400).json({ message: "Choose why the item is gone." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // archiving again only changes the reason, keeping the original date
    const [result] = await connection.query<ResultSetHeader>(
      `
      UPDATE clothing_items
      SET archived_at = COALESCE(archived_at, NOW()), archive_reason = ?
      WHERE id = ? AND user_id = ?
      `,
      [reason, itemId, userId],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Item not found." });
    }

    await connection.query(
      `
      UPDATE listings
      SET status = 'cancelled'
      WHERE clothing_item_id = ? AND status IN ('active', 'pending')
      `,
      [itemId],
    );

    await connection.commit();

    return res.status(200).json(await fetchOwnItem(itemId, userId));
  } catch (err) {
    await connection.rollback();
    console.error("Error archiving clothing item:", err);

    return res.status(500).json({ message: "Failed to remove item." });
  } finally {
    connection.release();
  }
});

// brings a past item back into the wardrobe; its listings stay as they were
router.put("/:id/restore", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const itemId = parseItemId(req.params.id);

  if (itemId === null) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE clothing_items
      SET archived_at = NULL, archive_reason = NULL
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    return res.status(200).json(await fetchOwnItem(itemId, userId));
  } catch (err) {
    console.error("Error restoring clothing item:", err);

    return res.status(500).json({ message: "Failed to restore item." });
  }
});

interface ClothingItemRow extends RowDataPacket {
  image_public_id: string | null;
  archived_at: Date | null;
}

// permanent: removes the item from its outfits and takes its listings and
// their conversations with it (the database cascades). Only past items can be
// deleted, so nothing disappears from outfits without first being archived
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const itemId = parseItemId(req.params.id);

  if (itemId === null) {
    return res.status(400).json({ message: "Invalid item id." });
  }

  try {
    const [rows] = await pool.execute<ClothingItemRow[]>(
      `
      SELECT image_public_id, archived_at
      FROM clothing_items
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    if (rows[0].archived_at === null) {
      return res.status(409).json({
        message: "Remove this item from your wardrobe before deleting it.",
      });
    }

    await pool.execute<ResultSetHeader>(
      `
      DELETE FROM clothing_items
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId],
    );

    // the row is gone, so a failed image cleanup only leaves an orphaned file
    const imagePublicId = rows[0].image_public_id;
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId).catch((err: unknown) => {
        console.error("Unable to delete item image:", err);
      });
    }

    return res.status(200).json({
      message: "Clothing item and image deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting clothing item:", err);
    return res.status(500).json({ message: "Failed to delete clothing item" });
  }
});

router.post("/create-listing", verifyToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const { clothingItemId, price, status = "active" } = req.body;

    if (!clothingItemId || price == null) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `
  SELECT id
  FROM clothing_items
  WHERE id = ? AND user_id = ? AND archived_at IS NULL
  `,
      [clothingItemId, userId],
    );

    if (rows.length === 0) {
      return res.status(403).json({
        message: "You do not own this clothing item.",
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO listings
        (clothing_item_id, seller_id, price, status)
      VALUES (?, ?, ?, ?)
      `,
      [clothingItemId, userId, price, status],
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Listing created successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to create listing.",
    });
  }
});

router.put("/favourite/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_favourite } = req.body;
    const userId = req.user!.id;

    const [result] = await pool.query(
      `
      UPDATE clothing_items
      SET is_favourite = ?
      WHERE id = ? AND user_id = ?
      `,
      [is_favourite, id, userId],
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({
        message: "Clothing item not found",
      });
    }

    return res.status(200).json({
      message: "Favourite updated successfully",
      is_favourite,
    });
  } catch (error) {
    console.error("Error updating favourite:", error);

    return res.status(500).json({
      message: "Failed to update favourite",
    });
  }
});

export default router;
