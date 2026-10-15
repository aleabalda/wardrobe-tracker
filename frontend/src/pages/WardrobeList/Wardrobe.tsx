import { useEffect, useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";
import {
  CLOTHING_TYPES,
  type ClothingType,
} from "../../types/clothingItemTypes";

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");

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

  const filteredItems =
    activeClothingType === "All Clothing"
      ? clothingItems
      : clothingItems.filter((item) => item.type === activeClothingType);

  return (
    <div className="p-12 pt-6">
      <div className="mb-8">
        <h2 className="text-4xl mb-4">{activeClothingType}</h2>
        <div className="flex gap-4 overflow-x-auto w-full">
          {CLOTHING_TYPES.map((val) => (
            <button
              key={val}
              aria-pressed={activeClothingType === val}
              className={`cursor-pointer hover:underline ${
                activeClothingType === val ? "underline" : ""
              }`}
              onClick={() => {
                setActiveClothingType(val);
              }}
            >
              <div
                className={`h-80 w-52 hover:border hover:border-black flex flex-col justify-end ${
                  activeClothingType === val ? "border border-black" : ""
                }`}
              ></div>
              <p className="text-left text-xs mt-2">{val}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2 flex justify-between">
        <ul className="flex gap-3">
          <li
            onClick={() => {
              setAddingItem(true);
            }}
            className="cursor-pointer hover:underline text-sm"
          >
            Add
          </li>
          <li className=" cursor-pointer hover:underline text-sm">Filter</li>
          <li className="hover:underline cursor-pointer text-sm">Sort</li>
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
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No clothing items of this type.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {filteredItems.map((item) => (
              <ClothingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
