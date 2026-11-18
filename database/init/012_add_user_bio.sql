USE `wardrobe`;

ALTER TABLE `users`
    ADD COLUMN `bio` VARCHAR(500) NULL AFTER `phone_number`;
