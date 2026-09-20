import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
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
    res.status(201).json({
      id: (result as any).insertId,
      name,
      imageUrl,
    });
    console.log("Clothing item created with ID:", (result as any).insertId);
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

    const [rows] = await pool.execute(
      "SELECT * FROM clothing_items WHERE user_id = ?",
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

router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user?.id;
  const itemId = req.params.id;
  console.log(`Fetching clothing item with id: ${itemId} for user: ${userId}`);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const [rows] = await pool.execute(
    `
    SELECT *
    FROM clothing_items
    WHERE id = ? AND user_id = ?
    `,
    [itemId, userId],
  );

  const items = rows as any[];

  if (items.length === 0) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json(items[0]);
});

interface ClothingItemRow extends RowDataPacket {
  id: number;
  image_public_id: string | null;
}

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [rows] = await pool.execute<ClothingItemRow[]>(
      `
      SELECT image_public_id
      FROM clothing_items
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Clothing item not found" });
    }

    const imagePublicId = rows[0].image_public_id;

    if (imagePublicId) {
      console.log(
        `Deleting image from Cloudinary with public ID: ${imagePublicId}`,
      );
      await cloudinary.uploader.destroy(imagePublicId);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `
      DELETE FROM clothing_items
      WHERE id = ? AND user_id = ?
      `,
      [itemId, userId],
    );

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
  WHERE id = ? AND user_id = ?
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
