USE `wardrobe`;

-- listings a user has saved; a separate table because many users can save the
-- same listing, unlike is_favourite on a user's own items and outfits
CREATE TABLE IF NOT EXISTS `saved_listings` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`user_id`, `listing_id`),

    CONSTRAINT `fk_saved_listings_user`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_saved_listings_listing`
        FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
