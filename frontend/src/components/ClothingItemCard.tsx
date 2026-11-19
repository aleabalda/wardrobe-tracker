import {
  Card,
  CardBadge,
  CardBody,
  CardBookmark,
  CardDetail,
  CardImage,
  CardPhoto,
} from "./CardParts";
import type { ClothingItem } from "../types/ClothingItems";
import { useState } from "react";
import { updateFavourite } from "../api/wardrobe";
import { getArchiveLabel } from "../utils/archiveReasons";

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
    <Card>
      <CardImage
        to={`/wardrobe/${item.id}`}
        label={`View details for ${item.name}`}
        badge={
          // e.g. "Donated", so outfits show what's no longer in the wardrobe
          item.archived_at && (
            <CardBadge>{getArchiveLabel(item.archive_reason)}</CardBadge>
          )
        }
      >
        <CardPhoto src={item.image_url} alt={item.name} />
      </CardImage>
      <CardBody
        title={item.name}
        aside={
          <CardBookmark
            isOn={isFavourite}
            disabled={isUpdatingFavourite}
            label={
              isFavourite
                ? `Remove ${item.name} from favourites`
                : `Add ${item.name} to favourites`
            }
            onToggle={() => {
              void handleFavourite();
            }}
          />
        }
      >
        <CardDetail>
          {[item.brand, `Size ${item.size}`].filter(Boolean).join(" | ")}
        </CardDetail>
        {item.color && <CardDetail>{item.color}</CardDetail>}
      </CardBody>
    </Card>
  );
};
