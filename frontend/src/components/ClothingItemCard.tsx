import type { ClothingItem } from "../types/ClothingItems";
import { Link } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { updateFavourite } from "../api/wardrobe";
import { CardDeleteButton } from "./CardDeleteButton";

export const ClothingItemCard = ({
  item,
  onDelete,
}: {
  item: ClothingItem;
  /** Shows a delete button on the card image when provided */
  onDelete?: () => void;
}) => {
  const [isFavourite, setIsFavourite] = useState(item.is_favourite);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);

  const handleFavourite = async () => {
    if (isUpdatingFavourite) return;

    const newValue = !isFavourite;

    setIsFavourite(newValue);
    setIsUpdatingFavourite(true);

    try {
      const savedValue = await updateFavourite(item.id, newValue);
      setIsFavourite(savedValue);
    } catch (error) {
      console.error("Failed to update favourite:", error);
      // Revert optimistic update
      setIsFavourite(!newValue);
    } finally {
      setIsUpdatingFavourite(false);
    }
  };

  return (
    <div className="mb-10">
      <div className="group relative border border-transparent p-0.5 transition-colors hover:border-black has-focus-visible:border-black">
        <Link
          to={`/wardrobe/${item.id}`}
          aria-label={`View details for ${item.name}`}
          className="block overflow-hidden"
        >
          <img
            src={item.image_url}
            alt={item.name}
            className="block w-full aspect-11/15 object-cover"
          />
        </Link>
        {onDelete && (
          <CardDeleteButton label={`Delete ${item.name}`} onClick={onDelete} />
        )}
      </div>
      <div className="px-2 pt-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0">{item.name}</h2>
          <IconButton
            size="small"
            edge="end"
            disabled={isUpdatingFavourite}
            aria-label={
              isFavourite ? "Remove from favourites" : "Add to favourites"
            }
            onClick={() => {
              handleFavourite();
            }}
            sx={{ color: "inherit", marginTop: "-5px" }}
          >
            {isFavourite ? (
              <BookmarkIcon fontSize="small" />
            ) : (
              <BookmarkBorderIcon fontSize="small" />
            )}
          </IconButton>
        </div>
        <p className="mt-1 text-gray-600 text-xs">
          {[item.brand, `Size ${item.size}`].filter(Boolean).join(" | ")}
        </p>
        {item.color && (
          <p className="mt-1 text-gray-600 text-xs">{item.color}</p>
        )}
      </div>
    </div>
  );
};
