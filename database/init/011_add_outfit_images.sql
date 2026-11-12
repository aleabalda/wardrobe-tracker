USE `wardrobe`;

-- optional photos of an outfit being worn; position 0 is the cover. An outfit
-- with none keeps showing the grid of its items' images
CREATE TABLE IF NOT EXISTS `outfit_images` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `outfit_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `image_public_id` VARCHAR(255) NOT NULL,
    `position` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_outfit_images_order` (`outfit_id`, `position`),

    CONSTRAINT `fk_outfit_images_outfit`
        FOREIGN KEY (`outfit_id`) REFERENCES `outfits`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
