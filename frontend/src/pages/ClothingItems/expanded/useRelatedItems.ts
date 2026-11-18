import { useEffect, useState } from "react";
import { fetchOutfits } from "../../../api/outfits";
import { fetchClothingItems } from "../../../api/wardrobe";
import type { ClothingItem } from "../../../types/ClothingItems";
import type { Outfit } from "../../../types/Outfit";

// how many outfits and similar items the side panel shows
const RELATED_COUNT = 3;

const sameText = (a: string, b: string) =>
  a.trim() !== "" && a.trim().toLowerCase() === b.trim().toLowerCase();

// type matters most, then colour and brand; items sharing none are left out
const similarityScore = (a: ClothingItem, b: ClothingItem) =>
  (sameText(a.type, b.type) ? 3 : 0) +
  (sameText(a.color, b.color) ? 2 : 0) +
  (sameText(a.brand, b.brand) ? 2 : 0);

/**
 * The newest outfits that use the item, and the most similar other items in
 * the wardrobe. They're extras, so a failure just leaves that list empty.
 */
export const useRelatedItems = (item: ClothingItem | null) => {
  const [recentOutfits, setRecentOutfits] = useState<Outfit[]>([]);
  const [similarItems, setSimilarItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    if (!item) return;

    const loadRelated = async () => {
      const [outfits, wardrobe] = await Promise.allSettled([
        fetchOutfits(),
        fetchClothingItems(),
      ]);

      if (outfits.status === "fulfilled") {
        setRecentOutfits(
          outfits.value
            .filter((outfit) => outfit.items.some(({ id }) => id === item.id))
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, RELATED_COUNT),
        );
      } else {
        console.error("Unable to load outfits:", outfits.reason);
      }

      if (wardrobe.status === "fulfilled") {
        setSimilarItems(
          wardrobe.value
            .filter((other) => other.id !== item.id)
            .map((other) => ({ other, score: similarityScore(item, other) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, RELATED_COUNT)
            .map(({ other }) => other),
        );
      } else {
        console.error("Unable to load wardrobe:", wardrobe.reason);
      }
    };

    void loadRelated();
    // only refetch when a different item opens, not when this one is edited
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  return { recentOutfits, similarItems };
};
