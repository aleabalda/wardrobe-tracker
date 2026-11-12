USE `wardrobe`;

-- every photo of a clothing item; position 0 is the cover. clothing_items keeps
-- its own image_url/image_public_id as a copy of the cover so existing queries
-- don't need to join this table
CREATE TABLE IF NOT EXISTS `clothing_item_images` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `clothing_item_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `image_public_id` VARCHAR(255) NOT NULL,
    `position` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_clothing_item_images_order` (`clothing_item_id`, `position`),

    CONSTRAINT `fk_clothing_item_images_item`
        FOREIGN KEY (`clothing_item_id`) REFERENCES `clothing_items`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- photos uploaded for a listing, separate from the item's own so the item's
-- originals are kept; a listing with none falls back to its item's photos.
-- Never point a row here at the same Cloudinary file as clothing_item_images,
-- or deleting one would delete the other's file
CREATE TABLE IF NOT EXISTS `listing_images` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `image_public_id` VARCHAR(255) NOT NULL,
    `position` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_listing_images_order` (`listing_id`, `position`),

    CONSTRAINT `fk_listing_images_listing`
        FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- each existing item's single image becomes its cover; skips items already
-- copied so this file is safe to run more than once
INSERT INTO `clothing_item_images` (`clothing_item_id`, `image_url`, `image_public_id`, `position`)
SELECT ci.`id`, ci.`image_url`, ci.`image_public_id`, 0
FROM `clothing_items` ci
WHERE ci.`image_url` IS NOT NULL
  AND ci.`image_public_id` IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM `clothing_item_images` cii
      WHERE cii.`clothing_item_id` = ci.`id`
  );
