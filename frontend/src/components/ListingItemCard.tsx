import type { ListingItem } from "../types/ListingItem";
import { Link } from "react-router-dom";

export const ListingItemCard = ({ item }: { item: ListingItem }) => {
  return (
    <Link to={`/wardrobe/${item.clothing_item_id}`} className="block">
      <div className="cursor-pointer rounded">
        <img
          src={item.image_url}
          alt={item.name}
          className="rounded aspect-square object-cover mb-1"
        />
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-600">
          {item.brand} | Size {item.size} | ${item.price}
        </p>
      </div>
    </Link>
  );
};
