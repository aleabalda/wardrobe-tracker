USE `wardrobe`;

-- a listing's own description, kept separate from its clothing item's so the
-- seller can describe condition etc. without changing their wardrobe notes
ALTER TABLE `listings`
    ADD COLUMN `description` TEXT NULL AFTER `price`;

-- listings used to write their description onto the item, so existing ones
-- start with the item's; skips listings that already have their own
UPDATE `listings` l
JOIN `clothing_items` ci ON ci.`id` = l.`clothing_item_id`
SET l.`description` = ci.`description`
WHERE l.`description` IS NULL;
