USE `wardrobe`;

-- one conversation per buyer per listing
CREATE TABLE IF NOT EXISTS `conversations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `buyer_id` BIGINT UNSIGNED NOT NULL,
    `seller_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- bumped on every new message so conversations can be sorted by activity
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `uq_conversation_listing_buyer` (`listing_id`, `buyer_id`),

    CONSTRAINT `fk_conversations_listing`
        FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_conversations_buyer`
        FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_conversations_seller`
        FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `messages` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` BIGINT UNSIGNED NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_messages_conversation` (`conversation_id`, `created_at`),

    CONSTRAINT `fk_messages_conversation`
        FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_messages_sender`
        FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
