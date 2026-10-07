import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";

const router = Router();

const upload = multer({
  dest: "uploads/", // temp storage
  limits: { fileSize: 5 * 1024 * 1024 },
});

interface UserDetailsRow extends RowDataPacket {
  id: number;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
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
        phone_number,
        avatar_url
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

interface UserAvatarRow extends RowDataPacket {
  avatar_public_id: string | null;
}

router.put("/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  let uploadedImagePublicId: string | null = null;

  try {
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "File must be an image." });
    }

    const [rows] = await pool.query<UserAvatarRow[]>(
      `
      SELECT avatar_public_id
      FROM users
      WHERE id = ?
      `,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const oldImagePublicId = rows[0].avatar_public_id;

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `wardrobe/${userId}/avatar`,
    });

    uploadedImagePublicId = uploadResult.public_id;
    const avatarUrl = uploadResult.secure_url;

    await pool.query<ResultSetHeader>(
      `
      UPDATE users
      SET avatar_url = ?, avatar_public_id = ?
      WHERE id = ?
      `,
      [avatarUrl, uploadedImagePublicId, userId],
    );

    // only remove the old image once the new one is saved
    if (oldImagePublicId) {
      await cloudinary.uploader
        .destroy(oldImagePublicId)
        .catch((err) => console.error("Failed to delete old avatar:", err));
    }

    return res.status(200).json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);

    // delete uploaded image if DB update fails
    if (uploadedImagePublicId) {
      await cloudinary.uploader.destroy(uploadedImagePublicId);
    }

    return res.status(500).json({
      message: "Failed to update profile picture.",
    });
  } finally {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
});

export default router;
