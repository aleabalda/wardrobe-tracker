import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { CreateNewListingForm } from "../../components/CreateNewListingForm";
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
import {
  LISTING_SORT_OPTIONS,
  compareListings,
  type ListingSortOption,
} from "../../utils/sortOptions";

export const Listings = () => {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isShopping, setIsShopping] = useState<boolean>(true);
  const [activeClothingType, setActiveClothingType] =
    useState<ClothingType>("All Clothing");
  const [sortOption, setSortOption] = useState<ListingSortOption>("newest");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);
  const [creatingListing, setCreatingListing] = useState<boolean>(false);
  const createListingButtonRef = useRef<HTMLButtonElement>(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  // items the user already has up for sale, so they can't be listed twice
  const listedItemIds = useMemo(
    () =>
      new Set(
        listings
          .filter(
            (item) =>
              item.seller_id === auth.userId &&
              (item.status === "active" || item.status === "pending"),
          )
          .map((item) => item.clothing_item_id),
      ),
    [listings, auth.userId],
  );

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
        headingAction={
          <div className="flex items-baseline gap-2 text-sm">
            <button
              type="button"
              aria-pressed={isShopping}
              onClick={() => {
                setIsShopping(true);
              }}
              className={`cursor-pointer ${isShopping ? "underline" : "hover:underline"}`}
            >
              Shop
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              aria-pressed={!isShopping}
              onClick={() => {
                setIsShopping(false);
              }}
              className={`cursor-pointer ${isShopping ? "hover:underline" : "underline"}`}
            >
              Sell
            </button>
          </div>
        }
      />
      <ItemToolbar
        items={typeListings}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredListings.length}
        sortOptions={LISTING_SORT_OPTIONS}
        sortValue={sortOption}
        onSortChange={setSortOption}
        action={
          !isShopping && (
            <button
              ref={createListingButtonRef}
              type="button"
              onClick={() => {
                setCreatingListing(true);
              }}
              className="cursor-pointer px-2 py-1 text-xs bg-black text-white transition-colors hover:bg-white hover:text-black hover:outline hover:outline-black"
            >
              Create Listing
            </button>
          )
        }
      />
      <AnimatePresence>
        {creatingListing && (
          <CreateNewListingForm
            listedItemIds={listedItemIds}
            onClose={() => {
              setCreatingListing(false);
              createListingButtonRef.current?.focus();
            }}
            onCreated={(listingId: number) => {
              void navigate(`/listings/${listingId}`);
            }}
          />
        )}
      </AnimatePresence>
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
