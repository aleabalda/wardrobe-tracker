import type { ListingStatus } from "../utils/listingStatus";

export type ListingItem = {
  id: number;
  name: string;
  description: string;
  brand: string;
  type: string;
  color: string;
  size: string;
  price: number | null;
  image_url: string;
  status: ListingStatus;
  created_at: string;
  clothing_item_id: number;
  seller_id: number;
};
