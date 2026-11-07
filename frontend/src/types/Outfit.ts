import type { ClothingItem } from "./ClothingItems";

export const OUTFIT_SEASONS = ["Fall", "Spring", "Summer", "Winter"] as const;

export type OutfitSeason = (typeof OUTFIT_SEASONS)[number];

export type Outfit = {
  id: number;
  name: string | null;
  description: string | null;
  // empty when no seasons were chosen
  season: OutfitSeason[];
  is_favourite: boolean;
  created_at: string;
  items: ClothingItem[];
};
