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
  bio: string | null;
  avatar_url: string | null;
  created_at: Date;
  item_count: number;
  outfit_count: number;
  active_listing_count: number;
}

// the account details plus a few counts for the profile overview
const fetchUserDetails = async (userId: number) => {
  const [rows] = await pool.query<UserDetailsRow[]>(
    `
    SELECT
      id,
      email,
      username,
      first_name,
      last_name,
      phone_number,
      bio,
      avatar_url,
      created_at,
      (SELECT COUNT(*) FROM clothing_items WHERE user_id = users.id)
        AS item_count,
      (SELECT COUNT(*) FROM outfits WHERE user_id = users.id) AS outfit_count,
      (
        SELECT COUNT(*) FROM listings
        WHERE seller_id = users.id AND status = 'active'
      ) AS active_listing_count
    FROM users
    WHERE id = ?
    `,
    [userId],
  );

  return rows[0] ?? null;
};

router.get("/fetch", verifyToken, async (req, res) => {
  try {
    const user = await fetchUserDetails(req.user!.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch user details.",
    });
  }
});

// longest each editable field may be, matching the users table
const PROFILE_FIELD_LIMITS = {
  username: 50,
  first_name: 100,
  last_name: 100,
  phone_number: 50,
  bio: 500,
} as const;

type ProfileField = keyof typeof PROFILE_FIELD_LIMITS;

// email and password aren't editable here since they're used to sign in
router.put("/profile", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const values = {} as Record<ProfileField, string | null>;

  for (const field of Object.keys(PROFILE_FIELD_LIMITS) as ProfileField[]) {
    const raw: unknown = req.body[field];

    if (raw !== undefined && raw !== null && typeof raw !== "string") {
      return res.status(400).json({ message: `${field} must be text.` });
    }

    // blank optional fields are stored as NULL
    const value = typeof raw === "string" ? raw.trim() : "";

    if (value.length > PROFILE_FIELD_LIMITS[field]) {
      return res.status(400).json({
        message: `${field} must be at most ${PROFILE_FIELD_LIMITS[field]} characters.`,
      });
    }

    values[field] = value === "" ? null : value;
  }

  if (!values.username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    await pool.query<ResultSetHeader>(
      `
      UPDATE users
      SET username = ?, first_name = ?, last_name = ?, phone_number = ?, bio = ?
      WHERE id = ?
      `,
      [
        values.username,
        values.first_name,
        values.last_name,
        values.phone_number,
        values.bio,
        userId,
      ],
    );

    return res.status(200).json(await fetchUserDetails(userId));
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "That username is taken." });
    }

    console.error(err);

    return res.status(500).json({
      message: "Failed to update profile.",
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
