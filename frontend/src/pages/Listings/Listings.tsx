import { useEffect, useState } from "react";
import { fetchAllListings } from "../../api/listings";
import type { ListingItem } from "../../types/ListingItem";
import { ListingItemCard } from "../../components/ListingItemCard";
import { ClothingTypeSelector } from "../../components/ClothingTypeSelector";
import { useAuth } from "../../context/AuthContext";
import type { ClothingType } from "../../types/clothingItemTypes";
import { ItemToolbar } from "../../components/ItemToolbar";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  matchesFilters,
  type ItemFilters,
} from "../../utils/itemFilters";

const SORT_OPTIONS = [
  { value: "newest", label: "Recently listed" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price (low to high)" },
  { value: "price-desc", label: "Price (high to low)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// the API can send decimal prices as strings, and listings without a price go last
const compareListings = (a: ListingItem, b: ListingItem, sort: SortOption) => {
  switch (sort) {
    case "newest":
      return b.id - a.id;
    case "oldest":
      return a.id - b.id;
    case "price-asc":
      return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
    case "price-desc":
      return Number(b.price ?? -Infinity) - Number(a.price ?? -Infinity);
  }
};

export const Listings = () => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isShopping, setIsShopping] = useState<boolean>(true);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const result = await fetchAllListings();
        console.log(result);
        setListings(result);
      } catch (error) {
        console.error("Unable to load listings:", error);
      }
    };

    void fetchListings();
  }, []);

  // shopping shows other users' listings that can still be bought, selling
  // shows all of the user's own
  const typeListings = listings.filter(
    (item) =>
      (isShopping
        ? item.seller_id !== auth.userId &&
          (item.status === "active" || item.status === "pending")
        : item.seller_id === auth.userId) &&
      (activeClothingType === "All Clothing" ||
        item.type === activeClothingType),
  );

  const filteredListings = typeListings
    .filter((item) => matchesFilters(item, filters))
    .sort((a, b) => compareListings(a, b, sortOption));

  return (
    <div className="p-12 pt-6">
      <ClothingTypeSelector
        activeType={activeClothingType}
        onSelect={setActiveClothingType}
        count={typeListings.length}
      />
      <ul className="mb-4 flex gap-4">
        <li
          onClick={() => {
            setIsShopping(!isShopping);
          }}
          className={`text-sm hover:underline cursor-pointer ${isShopping ? `underline` : ``}`}
        >
          Shop
        </li>
        <li
          onClick={() => {
            setIsShopping(!isShopping);
          }}
          className={`text-sm hover:underline cursor-pointer ${isShopping ? `` : `underline`}`}
        >
          Sell
        </li>
      </ul>
      <ItemToolbar
        items={typeListings}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredListings.length}
        sortOptions={SORT_OPTIONS}
        sortValue={sortOption}
        onSortChange={setSortOption}
        action={
          !isShopping && (
            <button
              type="button"
              className="cursor-pointer border border-black bg-black px-2 py-1 text-xs text-white transition-colors hover:bg-white hover:text-black"
            >
              Create Listing
            </button>
          )
        }
      />
      <div>
        {filteredListings.length === 0 ? (
          <p className="mt-4 text-gray-500 text-sm">
            {countActiveFilters(filters) > 0
              ? "No listings match these filters."
              : "No listings found."}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 mt-4">
            {filteredListings.map((item) => (
              <ListingItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
