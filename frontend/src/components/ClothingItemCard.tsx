import type { ClothingItem } from "../types/ClothingItems";
import { Link } from "react-router-dom";

export const ClothingItemCard = ({ item }: { item: ClothingItem }) => {
  return (
    <Link to={`/wardrobe/${item.id}`} className="block">
      <div className="cursor-pointer rounded">
        <img
          src={item.image_url}
          alt={item.name}
          className="rounded aspect-9/16 object-cover mb-1"
        />
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-600">
          {item.brand} | Size {item.size}
        </p>
      </div>
    </Link>
  );
};
