import type { Outfit } from "../types/Outfit";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { updateOutfitFavourite } from "../api/outfits";

// the cover shows up to this many item images in a 2x2 grid
const MAX_PREVIEW_ITEMS = 4;

export const OutfitCard = ({ outfit }: { outfit: Outfit }) => {
  const [isFavourite, setIsFavourite] = useState(outfit.is_favourite);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);

  const handleFavourite = async () => {
    if (isUpdatingFavourite) return;

    const newValue = !isFavourite;

    setIsFavourite(newValue);
    setIsUpdatingFavourite(true);

    try {
      const savedValue = await updateOutfitFavourite(outfit.id, newValue);
      setIsFavourite(savedValue);
    } catch (error) {
      console.error("Failed to update favourite:", error);
      // Revert optimistic update
      setIsFavourite(!newValue);
    } finally {
      setIsUpdatingFavourite(false);
    }
  };

  const previewItems = outfit.items.slice(0, MAX_PREVIEW_ITEMS);
  const hiddenCount = outfit.items.length - previewItems.length;

  return (
    <div className="mb-14">
      <Link
        to={`/outfits/${outfit.id}`}
        aria-label={`View ${outfit.name ?? "outfit"}`}
        className={`relative mb-1 grid aspect-9/16 gap-px overflow-hidden bg-gray-200 shadow-lg transition-shadow ease-in-out duration-150 hover:shadow-xl ${
          previewItems.length > 1 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {previewItems.map((item, index) => (
          <img
            key={item.id}
            src={item.image_url}
            alt={item.name}
            // with 3 items the first one spans the full top row
            className={`h-full w-full object-cover ${
              previewItems.length === 3 && index === 0 ? "col-span-2" : ""
            }`}
          />
        ))}
        {hiddenCount > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-white px-2 py-1 text-xs shadow">
            +{hiddenCount} more
          </span>
        )}
      </Link>
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">
          <Link to={`/outfits/${outfit.id}`} className="hover:underline">
            {outfit.name ?? "Untitled Outfit"}
          </Link>
        </h2>
        <IconButton
          aria-label={
            isFavourite
              ? "Remove outfit from favourites"
              : "Add outfit to favourites"
          }
          disabled={isUpdatingFavourite}
          onClick={() => {
            handleFavourite();
          }}
        >
          {isFavourite ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon />
          )}
        </IconButton>
      </div>
      <p className="text-xs text-gray-600">
        {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"}
      </p>
    </div>
  );
};
