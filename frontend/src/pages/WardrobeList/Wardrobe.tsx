import { useEffect, useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";
import { CLOTHING_TYPES } from "../../types/clothingItemTypes";

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
    <div className="p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-semibold mb-4">All Clothing</h2>
        <div className="flex gap-4 overflow-x-auto w-full">
          {CLOTHING_TYPES.map((val, key) => (
            <button key={key} className="cursor-pointer hover:underline">
              <div className="h-80 w-52 hover:border hover:border-black flex flex-col justify-end"></div>
              <p className="text-left text-xs mt-2">{val}</p>
            </button>
          ))}
        </div>
        {/* include code here to display all types of clothes (jackets, jeans, t-shirts, dresses, etc.) */}
      </div>
      <div className="mb-2 flex justify-between">
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
