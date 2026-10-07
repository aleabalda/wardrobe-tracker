USE `wardrobe`;

ALTER TABLE `users`
    ADD COLUMN `avatar_url` VARCHAR(255) NULL AFTER `phone_number`,
    ADD COLUMN `avatar_public_id` VARCHAR(255) NULL AFTER `avatar_url`;
