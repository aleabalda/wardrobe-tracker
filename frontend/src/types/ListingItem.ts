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
  // whether the logged in user has saved this listing
  is_saved: boolean;
  created_at: string;
  clothing_item_id: number;
  seller_id: number;
};

// the single listing endpoint also sends who's selling it
export type ListingDetail = ListingItem & {
  seller_name: string;
  seller_avatar_url: string | null;
  seller_joined_at: string;
};
