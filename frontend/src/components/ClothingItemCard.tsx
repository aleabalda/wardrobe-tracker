import type { ClothingItem } from "../types/ClothingItems";
import { Link } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
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
      <Link to={`/wardrobe/${item.id}`} className="block">
        <img
          src={item.image_url}
          alt={item.name}
          className="rounded cursor-pointer aspect-9/16 object-cover mb-1"
        />
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
