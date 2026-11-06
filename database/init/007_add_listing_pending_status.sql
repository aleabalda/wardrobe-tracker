USE `wardrobe`;

-- a sale that's in progress; 'cancelled' is shown to users as "Inactive"
ALTER TABLE `listings`
    MODIFY COLUMN `status` ENUM('active', 'sold', 'cancelled', 'pending') DEFAULT 'active';
