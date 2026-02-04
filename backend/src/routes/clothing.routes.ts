import multer from "multer";
import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../db/pool";

const router = Router();

const upload = multer({ limits: { fileSize: 5_000_000 } });

// Method to upload clothing image
router.post("/clothing-item", upload.single("image"), async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file!.path, {
    folder: "clothing",
  });

  await pool.query(
    "INSERT INTO clothing_items (name, image_url) VALUES (?, ?)",
    [req.body.name, result.secure_url],
  );

  res.json({ imageUrl: result.secure_url });
});
