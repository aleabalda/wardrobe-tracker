import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../db/pool";

const router = Router();

const upload = multer({
  dest: "uploads/", // temp storage
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/clothing", upload.single("image"), async (req, res) => {
  // var used to track if image was uploaded to cloudinary so we can delete if DB insert fails
  let uploadedImagePublicId: string | null = null;

  try {
    // return if no image is provided
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // get user id to ensure user is authenticated and for cloudinary folder structure
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // parsing req body
    const { name, brand, type, color, size, price, description, isForSale } =
      req.body;

    // basic validation if missing name or type
    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    // upload the image to cloudinary under the users id folder
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `wardrobe/${userId}`,
    });

    // set the upload id if successful and image url for db
    uploadedImagePublicId = uploadResult.public_id;
    const imageUrl = uploadResult.secure_url;

    // insert into db
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
        isForSale === "true" || isForSale === true,
      ],
    );

    res.status(201).json({
      id: (result as any).insertId,
      name,
      imageUrl,
    });
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

export default router;
