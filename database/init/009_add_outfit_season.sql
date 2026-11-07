USE `wardrobe`;

-- an outfit can be for any combination of seasons; NULL means none were chosen
ALTER TABLE `outfits`
    ADD COLUMN `season` SET('Fall', 'Spring', 'Summer', 'Winter') NULL DEFAULT NULL AFTER `description`;
