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
import {
  ITEM_SORT_OPTIONS,
  compareItems,
  type ItemSortOption,
} from "../../utils/sortOptions";

export const Wardrobe = () => {
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");
  const [sortOption, setSortOption] = useState<ItemSortOption>("newest");
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
        sortOptions={ITEM_SORT_OPTIONS}
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
