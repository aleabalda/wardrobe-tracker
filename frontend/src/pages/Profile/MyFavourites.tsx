import { useEffect, useState } from "react";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";

export const MyFavourites = () => {
  const [favouriteItems, setFavouriteItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const items = await fetchClothingItems(true);
        setFavouriteItems(items);
      } catch (error) {
        console.error("Unable to load favourite items:", error);
      }
    };

    void fetchFavourites();
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-semibold mb-2">Favourites</h2>

      {favouriteItems.length === 0 ? (
        <p className="mt-4 text-gray-500">No favourite items yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {favouriteItems.map((item) => (
            <ClothingItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
