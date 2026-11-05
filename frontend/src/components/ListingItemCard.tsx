import type { ListingItem } from "../types/ListingItem";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ListingItemCard = ({ item }: { item: ListingItem }) => {
  const { auth } = useAuth();
  // sellers manage their own item; everyone else gets the read-only listing
  const detailsPath =
    item.seller_id === auth.userId
      ? `/wardrobe/${item.clothing_item_id}`
      : `/listings/${item.id}`;

  return (
    <div className="mb-10">
      <Link
        to={detailsPath}
        aria-label={`View details for ${item.name}`}
        className="group block overflow-hidden"
      >
        <img
          src={item.image_url}
          alt={item.name}
          className="block w-full aspect-11/15 object-cover transition-transform ease-in-out duration-300 group-hover:scale-105 group-focus-visible:scale-105"
        />
      </Link>
      <div className="px-2 pt-3 text-sm">
        <div className="flex justify-between items-center">
          <p>{item.name}</p>
          {item.price != null && <p className="mt-1">${item.price}</p>}
        </div>
        <p className="mt-1 text-gray-600">
          {[item.brand, `Size ${item.size}`].filter(Boolean).join(" | ")}
        </p>
        {item.color && <p className="mt-1 text-gray-600">{item.color}</p>}
      </div>
    </div>
  );
};
