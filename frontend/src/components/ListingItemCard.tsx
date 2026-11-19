import {
  Card,
  CardBadge,
  CardBody,
  CardBookmark,
  CardDetail,
  CardImage,
  CardPhoto,
} from "./CardParts";
import type { ListingItem } from "../types/ListingItem";
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
    <Card>
      <CardImage
        to={`/listings/${item.id}`}
        label={`View details for ${item.name}`}
        badge={statusBadge && <CardBadge>{statusBadge}</CardBadge>}
      >
        <CardPhoto src={item.image_url} alt={item.name} />
      </CardImage>
      <CardBody
        title={item.name}
        aside={
          <>
            {item.price != null && <p>${item.price}</p>}
            {/* sellers can't save their own listing */}
            {!isOwnListing && (
              <CardBookmark
                isOn={isSaved}
                disabled={isUpdatingSaved}
                label={
                  isSaved
                    ? `Remove ${item.name} from saved listings`
                    : `Save ${item.name}`
                }
                onToggle={() => {
                  void handleSave();
                }}
              />
            )}
          </>
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
