import { useEffect, useState } from "react";
import { AddItemForm } from "../../components/AddItemForm";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";
import {
  CLOTHING_TYPES,
  type ClothingType,
} from "../../types/clothingItemTypes";

const SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// ids are auto-incremented, so they follow creation order. Items just added
// through AddItemForm don't come back with created_at, so ids are used instead
const compareItems = (a: ClothingItem, b: ClothingItem, sort: SortOption) => {
  switch (sort) {
    case "newest":
      return b.id - a.id;
    case "oldest":
      return a.id - b.id;
    case "name-asc":
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "name-desc":
      return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
  }
};

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

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

  // copied before sorting so the clothingItems state isn't mutated
  const filteredItems = [
    ...(activeClothingType === "All Clothing"
      ? clothingItems
      : clothingItems.filter((item) => item.type === activeClothingType)),
  ].sort((a, b) => compareItems(a, b, sortOption));

  const activeSortLabel = SORT_OPTIONS.find(
    ({ value }) => value === sortOption,
  )?.label;

  return (
    <div className="p-12 pt-6">
      <div className="mb-8">
        <h2 className="text-4xl mb-4">{activeClothingType}</h2>
        <div className="flex gap-4 overflow-x-auto w-full">
          {CLOTHING_TYPES.map(({ type, image }) => (
            <button
              key={type}
              aria-pressed={activeClothingType === type}
              className={`cursor-pointer hover:underline ${
                activeClothingType === type ? "underline" : ""
              }`}
              onClick={() => {
                setActiveClothingType(type);
              }}
            >
              <div
                className={`h-80 w-52 hover:border hover:border-black flex flex-col justify-end ${
                  activeClothingType === type ? "border border-black" : ""
                }`}
              >
                <img
                  src={image}
                  alt="the type of clothing item"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-left text-xs mt-2">{type}</p>
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
          <li className="relative text-sm">
            <button
              type="button"
              aria-expanded={isSortOpen}
              onClick={() => {
                setIsSortOpen(!isSortOpen);
              }}
              className="cursor-pointer hover:underline"
            >
              Sort: {activeSortLabel} {isSortOpen ? "▴" : "▾"}
            </button>
            {isSortOpen && (
              <>
                {/* invisible backdrop so clicking anywhere else closes the menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setIsSortOpen(false);
                  }}
                ></div>
                <ul
                  aria-label="Sort clothing items"
                  className="absolute left-0 top-full z-20 mt-2 w-44 border border-black bg-white py-1 shadow-lg"
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <li key={value}>
                      <button
                        type="button"
                        aria-pressed={sortOption === value}
                        onClick={() => {
                          setSortOption(value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full cursor-pointer px-3 py-1.5 text-left hover:underline ${
                          sortOption === value ? "underline" : ""
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        </ul>
      </div>
      <div className="w-full h-px rounded bg-black"></div>
      {addingItem && (
        <AddItemForm
          setAddingItem={setAddingItem}
          clothingItems={clothingItems}
          setClothingItems={setClothingItems}
        />
      )}
      <div>
        {clothingItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">No clothing items found.</p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">
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
