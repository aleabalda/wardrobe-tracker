import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchAllListings } from "../../api/listings";
import { fetchOutfits } from "../../api/outfits";
import { fetchClothingItems } from "../../api/wardrobe";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { ListingItemCard } from "../../components/ListingItemCard";
import { ItemToolbar } from "../../components/ItemToolbar";
import { OutfitCard } from "../../components/OutfitCard";
import type { ClothingItem } from "../../types/ClothingItems";
import type { ListingItem } from "../../types/ListingItem";
import type { Outfit } from "../../types/Outfit";
import {
  EMPTY_FILTERS,
  OUTFIT_FILTER_FIELDS,
  getOutfitFilterableItems,
  matchesFilters,
  outfitMatchesFilters,
  type FilterField,
  type FilterableItem,
  type ItemFilters,
} from "../../utils/itemFilters";
import {
  ITEM_SORT_OPTIONS,
  LISTING_SORT_OPTIONS,
  OUTFIT_SORT_OPTIONS,
  compareItems,
  compareListings,
  compareOutfits,
} from "../../utils/sortOptions";

const TABS = [
  { label: "Saved Items", to: "/favourites/items" },
  { label: "Saved Listings", to: "/favourites/listings" },
  { label: "Saved Outfits", to: "/favourites/outfits" },
];

export const Favourites = () => (
  <div className="p-12 pt-6">
    <h2 className="mb-4 text-5xl">Favourites</h2>
    <nav aria-label="Favourites">
      <ul className="mb-4 flex gap-4">
        {TABS.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `text-xs ${isActive ? "underline" : "hover:underline"}`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    <Outlet />
  </div>
);

// each tab is its own route, so switching tabs reloads it and anything unsaved
// since the last visit is gone; until then its card stays so it can be undone.
// The toolbar gets no action since this page only shows what's been saved
function SavedTab<Saved extends { id: number }, SortValue extends string>({
  load,
  noun,
  fields,
  resultNoun,
  sortOptions,
  compare,
  getFilterableItems,
  matches,
  renderCard,
}: {
  load: () => Promise<Saved[]>;
  /** What the tab lists, as used in its messages */
  noun: string;
  fields?: readonly FilterField[];
  resultNoun?: string;
  sortOptions: readonly { value: SortValue; label: string }[];
  compare: (a: Saved, b: Saved, sort: SortValue) => number;
  /** What the filter options are built from */
  getFilterableItems: (saved: Saved) => FilterableItem[];
  matches: (saved: Saved, filters: ItemFilters) => boolean;
  renderCard: (saved: Saved) => ReactNode;
}) {
  const [saved, setSaved] = useState<Saved[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortValue>(sortOptions[0].value);
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        setSaved(await load());
      } catch (error) {
        console.error(`Unable to load saved ${noun}:`, error);
        setError(`Unable to load your saved ${noun}.`);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSaved();
  }, [load, noun]);

  const visibleSaved = saved
    .filter((entry) => matches(entry, filters))
    .sort((a, b) => compare(a, b, sortOption));

  return (
    <>
      <ItemToolbar
        items={saved.flatMap(getFilterableItems)}
        fields={fields}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visibleSaved.length}
        resultNoun={resultNoun}
        sortOptions={sortOptions}
        sortValue={sortOption}
        onSortChange={setSortOption}
      />

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading saved {noun}...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : saved.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No saved {noun} yet.</p>
      ) : visibleSaved.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No saved {noun} match these filters.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleSaved.map(renderCard)}
        </div>
      )}
    </>
  );
}

const loadSavedItems = () => fetchClothingItems(true);
const loadSavedListings = () => fetchAllListings(true);
const loadSavedOutfits = () => fetchOutfits(true);

const renderItem = (item: ClothingItem) => (
  <ClothingItemCard key={item.id} item={item} />
);
const renderListing = (listing: ListingItem) => (
  <ListingItemCard key={listing.id} item={listing} />
);
const renderOutfit = (outfit: Outfit) => (
  <OutfitCard key={outfit.id} outfit={outfit} />
);

const asFilterableItems = (item: FilterableItem) => [item];

export const SavedItems = () => (
  <SavedTab
    load={loadSavedItems}
    noun="items"
    sortOptions={ITEM_SORT_OPTIONS}
    compare={compareItems}
    getFilterableItems={asFilterableItems}
    matches={matchesFilters}
    renderCard={renderItem}
  />
);

export const SavedListings = () => (
  <SavedTab
    load={loadSavedListings}
    noun="listings"
    sortOptions={LISTING_SORT_OPTIONS}
    compare={compareListings}
    getFilterableItems={asFilterableItems}
    matches={matchesFilters}
    renderCard={renderListing}
  />
);

export const SavedOutfits = () => (
  <SavedTab
    load={loadSavedOutfits}
    noun="outfits"
    fields={OUTFIT_FILTER_FIELDS}
    resultNoun="Outfit"
    sortOptions={OUTFIT_SORT_OPTIONS}
    compare={compareOutfits}
    getFilterableItems={getOutfitFilterableItems}
    matches={outfitMatchesFilters}
    renderCard={renderOutfit}
  />
);
