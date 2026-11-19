import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useSearchParams } from "react-router-dom";
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
  matchesSearch,
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
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // past items are ones the user no longer owns; kept in the URL so closing a
  // past item's page comes back to this view
  const [searchParams, setSearchParams] = useSearchParams();
  const isPast = searchParams.get("view") === "past";

  useEffect(() => {
    // ignores a slow response that arrives after switching views
    let isCurrent = true;
    setIsLoading(true);

    const fetchItems = async () => {
      try {
        const items = await fetchClothingItems({ archived: isPast });
        if (isCurrent) setClothingItems(items);
      } catch (error) {
        console.error("Unable to load clothing items:", error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void fetchItems();
    return () => {
      isCurrent = false;
    };
  }, [isPast]);

  const showView = (past: boolean) => {
    setSearchParams(past ? { view: "past" } : {});
  };

  const typeItems = clothingItems.filter(
    (item) =>
      activeClothingType === "All Clothing" || item.type === activeClothingType,
  );

  const filteredItems = typeItems
    .filter(
      (item) => matchesFilters(item, filters) && matchesSearch(item, search),
    )
    .sort((a, b) => compareItems(a, b, sortOption));

  return (
    <div className="p-12 pt-6">
      <ClothingTypeSelector
        activeType={activeClothingType}
        onSelect={setActiveClothingType}
        count={isLoading ? null : typeItems.length}
        headingAction={
          <div className="flex items-baseline gap-2 text-sm">
            <button
              type="button"
              aria-pressed={!isPast}
              onClick={() => {
                showView(false);
              }}
              className={`cursor-pointer ${isPast ? "hover:underline" : "underline"}`}
            >
              Current
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              aria-pressed={isPast}
              onClick={() => {
                showView(true);
              }}
              className={`cursor-pointer ${isPast ? "underline" : "hover:underline"}`}
            >
              Past
            </button>
          </div>
        }
      />
      <ItemToolbar
        items={typeItems}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredItems.length}
        sortOptions={ITEM_SORT_OPTIONS}
        sortValue={sortOption}
        onSortChange={setSortOption}
        search={search}
        onSearchChange={setSearch}
        searchLabel={isPast ? "Search past items" : "Search wardrobe"}
        action={
          !isPast && (
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
          )
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
        {isLoading ? (
          <p className="mt-4 text-gray-500 text-sm">Loading...</p>
        ) : clothingItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">
            {isPast
              ? "No past items. Items you sell, donate or remove from your wardrobe will show up here."
              : "No clothing items found."}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">
            {search.trim()
              ? `No clothing items match "${search.trim()}".`
              : countActiveFilters(filters) > 0
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
