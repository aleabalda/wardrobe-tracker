import type { ListingItem } from "../types/ListingItem";
import { Link } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export const ListingItemCard = ({ item }: { item: ListingItem }) => {
  return (
    <div>
      <Link
        to={`/wardrobe/${item.clothing_item_id}`}
        aria-label={`View details for ${item.name}`}
        className="group relative block mb-1 rounded overflow-hidden"
      >
        <img
          src={item.image_url}
          alt={item.name}
          className="block w-full rounded border border-black aspect-9/16 object-cover transition-all ease-in-out duration-150 group-hover:scale-105 group-focus-visible:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 transition-opacity ease-in-out duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-black shadow">
            <VisibilityOutlinedIcon fontSize="small" />
            View details
          </span>
        </div>
      </Link>
      <p className="text-lg font-semibold">{item.name}</p>
      <p className="text-sm text-gray-600">
        {item.brand} | Size {item.size} | ${item.price}
      </p>
    </div>
  );
};
