USE `wardrobe`;

-- the newest message each participant has seen; anything after it from the
-- other person is unread (NULL means nothing has been read yet)
ALTER TABLE `conversations`
    ADD COLUMN `buyer_last_read_message_id` BIGINT UNSIGNED NULL AFTER `seller_id`,
    ADD COLUMN `seller_last_read_message_id` BIGINT UNSIGNED NULL AFTER `buyer_last_read_message_id`;
