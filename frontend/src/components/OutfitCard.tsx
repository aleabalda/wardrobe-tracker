import {
  Card,
  CardBadge,
  CardBody,
  CardBookmark,
  CardDetail,
  CardImage,
} from "./CardParts";
import type { Outfit } from "../types/Outfit";
import { useState } from "react";
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
  const pastItemCount = outfit.items.filter((item) => item.archived_at).length;

  const name = outfit.name ?? "Untitled Outfit";

  return (
    <Card>
      <CardImage
        to={`/outfits/${outfit.id}`}
        label={`View ${name}`}
        badge={
          hiddenCount > 0 && (
            <CardBadge position="bottom-right">+{hiddenCount} more</CardBadge>
          )
        }
      >
        <div
          className={`grid h-full w-full gap-px bg-gray-200 ${
            previewItems.length > 1 ? "grid-cols-2" : "grid-cols-1"
          } ${previewItems.length > 2 ? "grid-rows-2" : "grid-rows-1"}`}
        >
          {previewItems.map((item, index) => (
            <img
              key={item.id}
              src={item.image_url}
              alt={item.name}
              // with 3 items the first one spans the full top row; items no
              // longer in the wardrobe are faded
              className={`h-full w-full min-h-0 object-cover ${
                previewItems.length === 3 && index === 0 ? "col-span-2" : ""
              } ${item.archived_at ? "opacity-50 grayscale" : ""}`}
            />
          ))}
        </div>
      </CardImage>
      <CardBody
        title={name}
        aside={
          <CardBookmark
            isOn={isFavourite}
            disabled={isUpdatingFavourite}
            label={
              isFavourite
                ? `Remove ${name} from favourites`
                : `Add ${name} to favourites`
            }
            onToggle={() => {
              void handleFavourite();
            }}
          />
        }
      >
        <CardDetail>
          {outfit.items.length} {outfit.items.length === 1 ? "item" : "items"}
          {pastItemCount > 0 && ` · ${pastItemCount} no longer owned`}
        </CardDetail>
      </CardBody>
    </Card>
  );
};
