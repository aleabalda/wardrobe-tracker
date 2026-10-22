import type { ClothingItem } from "./ClothingItems";

export type Outfit = {
  id: number;
  name: string | null;
  description: string | null;
  is_favourite: boolean;
  created_at: string;
  items: ClothingItem[];
};
