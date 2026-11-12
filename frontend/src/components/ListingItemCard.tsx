import type { ListingItem } from "../types/ListingItem";
import { Link } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { updateListingSaved } from "../api/listings";
import { useAuth } from "../context/AuthContext";
import { getListingStatusBadge } from "../utils/listingStatus";

export const ListingItemCard = ({ item }: { item: ListingItem }) => {
  const { auth } = useAuth();
  const [isSaved, setIsSaved] = useState(item.is_saved);
  const [isUpdatingSaved, setIsUpdatingSaved] = useState(false);
  const statusBadge = getListingStatusBadge(item.status);
  const isOwnListing = item.seller_id === auth.userId;
  // sellers manage their own item; everyone else gets the read-only listing
  const detailsPath = isOwnListing
    ? `/wardrobe/${item.clothing_item_id}`
    : `/listings/${item.id}`;

  const handleSave = async () => {
    if (isUpdatingSaved) return;

    const newValue = !isSaved;

    setIsSaved(newValue);
    setIsUpdatingSaved(true);

    try {
      setIsSaved(await updateListingSaved(item.id, newValue));
    } catch (error) {
      console.error("Failed to update saved listing:", error);
      // Revert optimistic update
      setIsSaved(!newValue);
    } finally {
      setIsUpdatingSaved(false);
    }
  };

  return (
    <div className="mb-10">
      <Link
        to={detailsPath}
        aria-label={`View details for ${item.name}`}
        className="group block overflow-hidden border border-transparent p-0.5 transition-colors hover:border-black focus-visible:border-black"
      >
        <img
          src={item.image_url}
          alt={item.name}
          className="block w-full aspect-11/15 object-cover"
        />
      </Link>
      <div className="px-2 pt-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0">{item.name}</p>
          <div className="flex shrink-0 items-start gap-1">
            {item.price != null && <p>${item.price}</p>}
            {/* sellers can't save their own listing */}
            {!isOwnListing && (
              <IconButton
                size="small"
                edge="end"
                disabled={isUpdatingSaved}
                aria-label={
                  isSaved
                    ? `Remove ${item.name} from saved listings`
                    : `Save ${item.name}`
                }
                onClick={() => {
                  void handleSave();
                }}
                sx={{ color: "inherit", marginTop: "-5px" }}
              >
                {isSaved ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </div>
        </div>
        <p className="mt-1 text-gray-600">
          {[item.brand, `Size ${item.size}`].filter(Boolean).join(" | ")}
        </p>
        {item.color && <p className="mt-1 text-gray-600">{item.color}</p>}
        {statusBadge && <p className="mt-1">{statusBadge}</p>}
      </div>
    </div>
  );
};
