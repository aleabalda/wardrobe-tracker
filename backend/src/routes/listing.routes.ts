import { Router } from "express";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  DESCRIPTION_LIMIT,
  ITEM_FIELD_LIMITS,
  LISTING_STATUSES,
  REQUIRED_ITEM_FIELDS,
  readTextFields,
} from "../utils/textFields";

// is_saved is worked out in the query, so MySQL returns it as a 0/1 number
// rather than a TINYINT(1) the pool's typeCast would turn into a boolean
const withSavedFlag = (row: RowDataPacket) => ({
  ...row,
  is_saved: Boolean(row.is_saved),
});

const router = Router();

router.post("/create", verifyToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user!.id;
    const { clothingItemId, price, status = "active", description } = req.body;

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
        (clothing_item_id, seller_id, price, description, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        clothingItemId,
        userId,
        price,
        typeof description === "string" ? description.trim() || null : null,
        status,
      ],
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

    // optional ?saved=true to only return listings this user has saved
    const savedOnly = req.query.saved === "true";

    console.log("about to fetch listings");
    const [rows] = await pool.execute(
      `
      SELECT
        listings.*,
        clothing_items.name,
        clothing_items.brand,
        clothing_items.type,
        clothing_items.color,
        clothing_items.size,
        clothing_items.image_url,
        saved.listing_id IS NOT NULL AS is_saved
      FROM listings
      JOIN clothing_items ON listings.clothing_item_id = clothing_items.id
      LEFT JOIN saved_listings saved
        ON saved.listing_id = listings.id AND saved.user_id = ?
      ${savedOnly ? "WHERE saved.listing_id IS NOT NULL" : ""}
      `,
      [userId],
    );
    console.log("fetched listings");
    res.status(200).json((rows as RowDataPacket[]).map(withSavedFlag));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch listings",
    });
  }
});

// saves a listing for this user or removes it from their saved listings
router.put("/saved/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const listingId = Number(req.params.id);
  const { is_saved: isSaved } = req.body;

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ message: "Invalid listing id." });
  }

  if (typeof isSaved !== "boolean") {
    return res.status(400).json({ message: "is_saved must be a boolean." });
  }

  try {
    if (!isSaved) {
      await pool.query(
        `
        DELETE FROM saved_listings
        WHERE user_id = ? AND listing_id = ?
        `,
        [userId, listingId],
      );

      return res.status(200).json({ is_saved: false });
    }

    const [listingRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT seller_id
      FROM listings
      WHERE id = ?
      `,
      [listingId],
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ message: "Listing not found." });
    }

    if (listingRows[0].seller_id === userId) {
      return res.status(400).json({
        message: "You can't save your own listing.",
      });
    }

    // saving twice (e.g. from two tabs) keeps the original row
    await pool.query(
      `
      INSERT IGNORE INTO saved_listings
        (user_id, listing_id)
      VALUES (?, ?)
      `,
      [userId, listingId],
    );

    return res.status(200).json({ is_saved: true });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to update saved listing.",
    });
  }
});

// one listing with its item's details and seller, or null if there's none.
// listings.description is the listing's own, separate from the item's
const fetchListingDetail = async (listingId: number, userId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      listings.*,
      clothing_items.name,
      clothing_items.brand,
      clothing_items.type,
      clothing_items.color,
      clothing_items.size,
      clothing_items.image_url,
      saved.listing_id IS NOT NULL AS is_saved,
      COALESCE(seller.username, seller.first_name, 'User') AS seller_name,
      seller.avatar_url AS seller_avatar_url,
      seller.created_at AS seller_joined_at
    FROM listings
    JOIN clothing_items ON listings.clothing_item_id = clothing_items.id
    JOIN users seller ON seller.id = listings.seller_id
    LEFT JOIN saved_listings saved
      ON saved.listing_id = listings.id AND saved.user_id = ?
    WHERE listings.id = ?
    `,
    [userId, listingId],
  );

  return rows.length > 0 ? withSavedFlag(rows[0]) : null;
};

// any logged in user can view a listing, not just the seller
router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const listingId = Number(req.params.id);

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ message: "Invalid listing id." });
  }

  try {
    const listing = await fetchListingDetail(listingId, userId);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.status(200).json(listing);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch listing.",
    });
  }
});

// highest price a DECIMAL(10,2) column holds
const MAX_PRICE = 99999999.99;

/**
 * Only the seller can edit a listing. Name, brand, type, colour and size
 * belong to the clothing item, so they change in the wardrobe too; price,
 * status and description are the listing's own
 */
router.put("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const listingId = Number(req.params.id);

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ message: "Invalid listing id." });
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
  const { status } = req.body;
  // accepts "12.5" as well as 12.5 since form values arrive as text
  const price = Number(req.body.price);

  if (
    req.body.price === "" ||
    req.body.price === null ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > MAX_PRICE
  ) {
    return res.status(400).json({ message: "Enter a valid price." });
  }

  if (!LISTING_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid listing status." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [listingResult] = await connection.query<ResultSetHeader>(
      `
      UPDATE listings
      SET price = ?, status = ?, description = ?
      WHERE id = ? AND seller_id = ?
      `,
      [
        Math.round(price * 100) / 100,
        status,
        values.description,
        listingId,
        userId,
      ],
    );

    if (listingResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Listing not found." });
    }

    await connection.query<ResultSetHeader>(
      `
      UPDATE clothing_items ci
      JOIN listings l ON l.clothing_item_id = ci.id
      SET ci.name = ?, ci.brand = ?, ci.type = ?, ci.color = ?, ci.size = ?
      WHERE l.id = ? AND ci.user_id = ?
      `,
      [
        values.name,
        values.brand,
        values.type,
        values.color,
        values.size,
        listingId,
        userId,
      ],
    );

    await connection.commit();

    return res.status(200).json(await fetchListingDetail(listingId, userId));
  } catch (err) {
    await connection.rollback();
    console.error(err);

    return res.status(500).json({ message: "Failed to update listing." });
  } finally {
    connection.release();
  }
});

export default router;
