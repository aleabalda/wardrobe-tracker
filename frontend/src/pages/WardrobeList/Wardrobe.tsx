import { useEffect, useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchClothingItems } from "../../api/wardrobe";

interface ClothingItem {
  id: number;
  name: string;
  description: string;
  brand: string;
  type: string;
  color: string;
  size: string;
  price: number | null;
  is_for_sale: boolean;
  image_url: string;
}

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await fetchClothingItems();
        setClothingItems(items);
      } catch (error) {
        console.error("Unable to load clothing items:", error);
      }
    };

    void fetchItems();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-2">
        <ul className="flex gap-4">
          <li
            onClick={() => {
              setAddingItem(true);
            }}
            className="font-semibold cursor-pointer hover:underline"
          >
            Add
          </li>
          <li className="font-semibold cursor-pointer hover:underline">
            Filter
          </li>
          <li className="font-semibold hover:underline cursor-pointer">Sort</li>
        </ul>
      </div>
      <div className="w-full h-0.5 rounded bg-black"></div>
      {addingItem && (
        <AddItemForm
          setAddingItem={setAddingItem}
          clothingItems={clothingItems}
          setClothingItems={setClothingItems}
        />
      )}
      <div>
        {clothingItems.length === 0 ? (
          <p className="mt-4 text-gray-500">No clothing items found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {clothingItems.map((item) => (
              <ClothingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
