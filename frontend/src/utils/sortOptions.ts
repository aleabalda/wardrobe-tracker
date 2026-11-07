import type { ClothingItem } from "../types/ClothingItems";
import type { ListingItem } from "../types/ListingItem";
import type { Outfit } from "../types/Outfit";

// ids are auto-incremented, so they follow creation order. Items just added
// through AddItemForm don't come back with created_at, so ids are used instead

export const ITEM_SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
] as const;

export type ItemSortOption = (typeof ITEM_SORT_OPTIONS)[number]["value"];

export const compareItems = (
  a: ClothingItem,
  b: ClothingItem,
  sort: ItemSortOption,
) => {
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

export const LISTING_SORT_OPTIONS = [
  { value: "newest", label: "Recently listed" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price (low to high)" },
  { value: "price-desc", label: "Price (high to low)" },
] as const;

export type ListingSortOption = (typeof LISTING_SORT_OPTIONS)[number]["value"];

// the API can send decimal prices as strings, and listings without a price go last
export const compareListings = (
  a: ListingItem,
  b: ListingItem,
  sort: ListingSortOption,
) => {
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

export const OUTFIT_SORT_OPTIONS = [
  { value: "newest", label: "Recently created" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "most-items", label: "Most items" },
  { value: "fewest-items", label: "Fewest items" },
] as const;

export type OutfitSortOption = (typeof OUTFIT_SORT_OPTIONS)[number]["value"];

export const compareOutfits = (
  a: Outfit,
  b: Outfit,
  sort: OutfitSortOption,
) => {
  const compareNames = () =>
    (a.name ?? "Untitled Outfit").localeCompare(
      b.name ?? "Untitled Outfit",
      undefined,
      { sensitivity: "base" },
    );

  switch (sort) {
    case "newest":
      return b.id - a.id;
    case "oldest":
      return a.id - b.id;
    case "name-asc":
      return compareNames();
    case "name-desc":
      return -compareNames();
    case "most-items":
      return b.items.length - a.items.length;
    case "fewest-items":
      return a.items.length - b.items.length;
  }
};
