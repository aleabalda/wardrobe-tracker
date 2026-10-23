import { Router } from "express";
import { pool } from "../db/pool";
import { verifyToken } from "../middleware/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { emitToUsers } from "../socket";

const router = Router();

const MAX_MESSAGE_LENGTH = 2000;

// conversation summary from the point of view of the user whose id is passed
// as the first parameter (other_user_* is whoever they're talking to)
const CONVERSATION_SUMMARY_SQL = `
  SELECT
    c.id,
    c.listing_id,
    c.buyer_id,
    c.seller_id,
    c.updated_at,
    l.clothing_item_id,
    l.price,
    ci.name AS item_name,
    ci.image_url,
    other.id AS other_user_id,
    COALESCE(other.username, other.first_name, 'User') AS other_user_name,
    last_message.body AS last_message,
    last_message.created_at AS last_message_at,
    -- messages from the other person newer than the last one this user read
    (
      SELECT COUNT(*)
      FROM messages unread
      WHERE unread.conversation_id = c.id
        AND unread.sender_id = other.id
        AND unread.id > COALESCE(
          IF(
            c.buyer_id = other.id,
            c.seller_last_read_message_id,
            c.buyer_last_read_message_id
          ),
          0
        )
    ) AS unread_count
  FROM conversations c
  JOIN listings l ON l.id = c.listing_id
  JOIN clothing_items ci ON ci.id = l.clothing_item_id
  JOIN users other
    ON other.id = IF(c.buyer_id = ?, c.seller_id, c.buyer_id)
  LEFT JOIN messages last_message ON last_message.id = (
    SELECT m.id
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 1
  )
`;

// starts a conversation with a listing's seller, or returns the existing one
router.post("/start", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const listingId = Number(req.body.listingId);

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ message: "Invalid listing id." });
  }

  try {
    const [listingRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT seller_id, status
      FROM listings
      WHERE id = ?
      `,
      [listingId],
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const { seller_id: sellerId, status } = listingRows[0];

    if (sellerId === userId) {
      return res.status(400).json({
        message: "You can't message yourself about your own listing.",
      });
    }

    const [existingRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id
      FROM conversations
      WHERE listing_id = ? AND buyer_id = ?
      `,
      [listingId, userId],
    );

    if (existingRows.length > 0) {
      return res.status(200).json({ id: existingRows[0].id });
    }

    if (status !== "active") {
      return res.status(400).json({
        message: "This listing is no longer available.",
      });
    }

    // LAST_INSERT_ID(id) returns the existing row's id if a duplicate
    // request created the conversation in the meantime
    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO conversations
        (listing_id, buyer_id, seller_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
      `,
      [listingId, userId, sellerId],
    );

    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to start conversation.",
    });
  }
});

router.get("/get", verifyToken, async (req, res) => {
  const userId = req.user!.id;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      ${CONVERSATION_SUMMARY_SQL}
      WHERE c.buyer_id = ? OR c.seller_id = ?
      ORDER BY c.updated_at DESC
      `,
      [userId, userId, userId],
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch conversations.",
    });
  }
});

// total unread messages across all of the user's conversations
// (registered before /:id so "unread-count" isn't treated as an id)
router.get("/unread-count", verifyToken, async (req, res) => {
  const userId = req.user!.id;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.buyer_id = ? OR c.seller_id = ?)
        AND m.sender_id <> ?
        AND m.id > COALESCE(
          IF(
            c.buyer_id = ?,
            c.buyer_last_read_message_id,
            c.seller_last_read_message_id
          ),
          0
        )
      `,
      [userId, userId, userId, userId],
    );

    return res.status(200).json({ count: rows[0].count });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch unread count.",
    });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const conversationId = Number(req.params.id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ message: "Invalid conversation id." });
  }

  try {
    const [conversationRows] = await pool.query<RowDataPacket[]>(
      `
      ${CONVERSATION_SUMMARY_SQL}
      WHERE c.id = ? AND (c.buyer_id = ? OR c.seller_id = ?)
      `,
      [userId, conversationId, userId, userId],
    );

    if (conversationRows.length === 0) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const [messageRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id, conversation_id, sender_id, body, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC, id ASC
      `,
      [conversationId],
    );

    return res.status(200).json({
      ...conversationRows[0],
      messages: messageRows,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to fetch conversation.",
    });
  }
});

// marks every message currently in the conversation as read by this user
router.post("/:id/read", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const conversationId = Number(req.params.id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ message: "Invalid conversation id." });
  }

  try {
    // updated_at is set to itself so reading doesn't reorder the
    // conversation list (it's otherwise bumped by ON UPDATE)
    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE conversations c
      LEFT JOIN (
        SELECT MAX(id) AS id
        FROM messages
        WHERE conversation_id = ?
      ) latest ON TRUE
      SET
        c.buyer_last_read_message_id = IF(
          c.buyer_id = ?, latest.id, c.buyer_last_read_message_id
        ),
        c.seller_last_read_message_id = IF(
          c.seller_id = ?, latest.id, c.seller_last_read_message_id
        ),
        c.updated_at = c.updated_at
      WHERE c.id = ? AND (c.buyer_id = ? OR c.seller_id = ?)
      `,
      [conversationId, userId, userId, conversationId, userId, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    // lets the user's other open tabs clear the unread highlight too
    emitToUsers([userId], "conversation:read", { conversationId });

    return res.status(200).json({ message: "Conversation marked as read." });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to mark conversation as read.",
    });
  }
});

router.post("/:id/messages", verifyToken, async (req, res) => {
  const userId = req.user!.id;
  const conversationId = Number(req.params.id);
  const { body } = req.body;

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ message: "Invalid conversation id." });
  }

  if (typeof body !== "string" || body.trim().length === 0) {
    return res.status(400).json({ message: "Message can't be empty." });
  }

  if (body.trim().length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [conversationRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT buyer_id, seller_id
      FROM conversations
      WHERE id = ? AND (buyer_id = ? OR seller_id = ?)
      `,
      [conversationId, userId, userId],
    );

    if (conversationRows.length === 0) {
      await connection.rollback();

      return res.status(404).json({ message: "Conversation not found." });
    }

    const [result] = await connection.query<ResultSetHeader>(
      `
      INSERT INTO messages
        (conversation_id, sender_id, body)
      VALUES (?, ?, ?)
      `,
      [conversationId, userId, body.trim()],
    );

    // keeps the conversation list ordered by latest activity
    await connection.query(
      `
      UPDATE conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [conversationId],
    );

    const [messageRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT id, conversation_id, sender_id, body, created_at
      FROM messages
      WHERE id = ?
      `,
      [result.insertId],
    );

    await connection.commit();

    // only pushed after commit so nobody receives a message that rolled back
    const { buyer_id: buyerId, seller_id: sellerId } = conversationRows[0];
    emitToUsers([buyerId, sellerId], "message:new", messageRows[0]);

    return res.status(201).json(messageRows[0]);
  } catch (err) {
    await connection.rollback();

    console.error(err);

    return res.status(500).json({
      message: "Failed to send message.",
    });
  } finally {
    connection.release();
  }
});

export default router;
