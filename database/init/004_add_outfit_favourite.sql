USE `wardrobe`;

ALTER TABLE `outfits`
    ADD COLUMN `is_favourite` BOOLEAN DEFAULT FALSE AFTER `description`;
