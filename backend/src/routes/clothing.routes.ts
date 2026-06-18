import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";

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
          is_for_sale
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

export default router;
