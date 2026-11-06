import type { ListingStatus } from "../utils/listingStatus";

export type ClothingItem = {
  id: number;
  name: string;
  description: string;
  brand: string;
  type: string;
  color: string;
  size: string;
  price: number | null;
  is_for_sale: boolean;
  is_favourite: boolean;
  image_url: string;
  // only sent when fetching a single item; null if it was never listed
  listing_id?: number | null;
  listing_status?: ListingStatus | null;
};
