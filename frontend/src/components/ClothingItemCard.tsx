import type { ClothingItem } from "../types/ClothingItems";
import { Link } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { updateFavourite } from "../api/wardrobe";

export const ClothingItemCard = ({ item }: { item: ClothingItem }) => {
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
    <div>
      <Link
        to={`/wardrobe/${item.id}`}
        aria-label={`View details for ${item.name}`}
        className="group relative block mb-1 rounded overflow-hidden"
      >
        <img
          src={item.image_url}
          alt={item.name}
          className="block w-full rounded border border-black aspect-9/16 object-cover transition-all ease-in-out duration-150 group-hover:scale-105 group-focus-visible:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 transition-opacity ease-in-out duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-black shadow">
            <VisibilityOutlinedIcon fontSize="small" />
            View details
          </span>
        </div>
      </Link>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <IconButton
          disabled={isUpdatingFavourite}
          onClick={() => {
            handleFavourite();
          }}
        >
          {isFavourite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </div>
      <p className="text-sm text-gray-600">
        {item.brand} | Size {item.size}
      </p>
    </div>
  );
};
