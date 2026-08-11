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
  status: string;
  created_at: string;
  clothing_item_id: number;
  seller_id: number;
};
