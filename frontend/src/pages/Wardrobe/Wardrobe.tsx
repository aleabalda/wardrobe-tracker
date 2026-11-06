import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { AddItemForm } from "../../components/AddItemForm";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { ClothingTypeSelector } from "../../components/ClothingTypeSelector";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";
import type { ClothingType } from "../../types/clothingItemTypes";
import { ItemToolbar } from "../../components/ItemToolbar";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  matchesFilters,
  type ItemFilters,
} from "../../utils/itemFilters";

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
  const addItemButtonRef = useRef<HTMLButtonElement>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);

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

  const typeItems = clothingItems.filter(
    (item) =>
      activeClothingType === "All Clothing" || item.type === activeClothingType,
  );

  const filteredItems = typeItems
    .filter((item) => matchesFilters(item, filters))
    .sort((a, b) => compareItems(a, b, sortOption));

  return (
    <div className="p-12 pt-6">
      <ClothingTypeSelector
        activeType={activeClothingType}
        onSelect={setActiveClothingType}
        count={typeItems.length}
      />
      <ItemToolbar
        items={typeItems}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredItems.length}
        sortOptions={SORT_OPTIONS}
        sortValue={sortOption}
        onSortChange={setSortOption}
        action={
          <button
            ref={addItemButtonRef}
            type="button"
            onClick={() => {
              setAddingItem(true);
            }}
            className="cursor-pointer border border-black bg-black px-2 py-1 text-xs text-white transition-colors hover:bg-white hover:text-black"
          >
            Add Item
          </button>
        }
      />
      <AnimatePresence>
        {addingItem && (
          <AddItemForm
            onClose={() => {
              setAddingItem(false);
              addItemButtonRef.current?.focus();
            }}
            clothingItems={clothingItems}
            setClothingItems={setClothingItems}
          />
        )}
      </AnimatePresence>
      <div>
        {clothingItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">No clothing items found.</p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">
            {countActiveFilters(filters) > 0
              ? "No clothing items match these filters."
              : "No clothing items of this type."}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 mt-4">
            {filteredItems.map((item) => (
              <ClothingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
