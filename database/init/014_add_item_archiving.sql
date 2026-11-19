USE `wardrobe`;

-- items the user no longer owns (sold, donated, thrown out) are archived
-- instead of deleted, so outfits that include them stay complete.
-- archived_at is NULL while the item is still in the wardrobe
ALTER TABLE `clothing_items`
    ADD COLUMN `archived_at` DATETIME NULL AFTER `is_favourite`,
    ADD COLUMN `archive_reason` ENUM('sold', 'donated', 'discarded', 'other') NULL AFTER `archived_at`,
    ADD INDEX `idx_clothing_user_archived` (`user_id`, `archived_at`);
