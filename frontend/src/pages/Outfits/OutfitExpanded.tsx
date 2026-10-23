import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import { ClothingItemCard } from "../../components/ClothingItemCard";
import { fetchOutfitById, updateOutfitFavourite } from "../../api/outfits";
import type { Outfit } from "../../types/Outfit";
import { CLOTHING_TYPES } from "../../types/clothingItemTypes";

// items are grouped in the same order as the wardrobe's clothing types
const CATEGORY_ORDER: string[] = CLOTHING_TYPES.map(({ type }) => type).filter(
  (type) => type !== "All Clothing",
);

export const OutfitExpanded = () => {
  const { id } = useParams<{ id: string }>();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No outfit ID was provided.");
      return;
    }

    const loadOutfit = async () => {
      try {
        setError(null);

        const result = await fetchOutfitById(id);
        setOutfit(result);
      } catch (error) {
        console.error("Unable to load outfit:", error);
        setError("Unable to load this outfit.");
      }
    };

    void loadOutfit();
  }, [id]);

  const handleFavourite = async () => {
    if (!outfit || isUpdatingFavourite) return;

    const newValue = !outfit.is_favourite;

    setOutfit({ ...outfit, is_favourite: newValue });
    setIsUpdatingFavourite(true);

    try {
      const savedValue = await updateOutfitFavourite(outfit.id, newValue);
      setOutfit((current) =>
        current ? { ...current, is_favourite: savedValue } : current,
      );
    } catch (error) {
      console.error("Failed to update favourite:", error);
      // Revert optimistic update
      setOutfit((current) =>
        current ? { ...current, is_favourite: !newValue } : current,
      );
    } finally {
      setIsUpdatingFavourite(false);
    }
  };

  if (error && !outfit) {
    return <p className="p-12 pt-6 text-red-600">{error}</p>;
  }

  if (!outfit) {
    return <p className="p-12 pt-6">Loading outfit...</p>;
  }

  // any type not in CATEGORY_ORDER is listed after the known ones
  const categories = [
    ...CATEGORY_ORDER,
    ...new Set(
      outfit.items
        .map((item) => item.type)
        .filter((type) => !CATEGORY_ORDER.includes(type)),
    ),
  ]
    .map((category) => ({
      category,
      items: outfit.items.filter((item) => item.type === category),
    }))
    .filter(({ items }) => items.length > 0);

  const colours = [
    ...new Set(outfit.items.map((item) => item.color).filter(Boolean)),
  ];
  const brands = [
    ...new Set(outfit.items.map((item) => item.brand).filter(Boolean)),
  ];

  // prices come back from MySQL as strings, so they're converted first
  const pricedItems = outfit.items.filter((item) => item.price !== null);
  const totalValue = pricedItems.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  const createdDate = new Date(outfit.created_at).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    // on large screens the page fills the viewport and only the items column
    // scrolls; on smaller screens it stacks and scrolls normally
    <div className="p-12 pt-6 lg:flex lg:h-full lg:flex-col">
      <Link to="/outfits" className="text-xs hover:underline">
        ← Back to Outfits
      </Link>

      <div className="mt-2 mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-4xl">
            {outfit.name ?? "Untitled Outfit"}
          </h1>
          <IconButton
            aria-label={
              outfit.is_favourite
                ? "Remove outfit from favourites"
                : "Add outfit to favourites"
            }
            disabled={isUpdatingFavourite}
            onClick={() => {
              void handleFavourite();
            }}
          >
            {outfit.is_favourite ? (
              <BookmarkIcon fontSize="small" />
            ) : (
              <BookmarkBorderIcon />
            )}
          </IconButton>
        </div>
        <p className="shrink-0 text-xs text-gray-500">Created {createdDate}</p>
      </div>
      <div className="w-full h-px rounded bg-black mb-6"></div>

      <div className="flex flex-col gap-10 lg:min-h-0 lg:flex-1 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0 lg:overflow-y-auto">
          {outfit.description && (
            <p className="mb-6 text-sm text-gray-700">{outfit.description}</p>
          )}

          <h2 className="mb-3 font-semibold">Details</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Items</dt>
            <dd>{outfit.items.length}</dd>

            <dt className="text-gray-500">Categories</dt>
            <dd>{categories.map(({ category }) => category).join(", ")}</dd>

            {brands.length > 0 && (
              <>
                <dt className="text-gray-500">Brands</dt>
                <dd>{brands.join(", ")}</dd>
              </>
            )}

            {pricedItems.length > 0 && (
              <>
                <dt className="text-gray-500">Total value</dt>
                <dd>
                  ${totalValue.toFixed(2)}
                  {pricedItems.length < outfit.items.length && (
                    <span className="block text-xs text-gray-500">
                      {pricedItems.length} of {outfit.items.length} items priced
                    </span>
                  )}
                </dd>
              </>
            )}
          </dl>

          {colours.length > 0 && (
            <>
              <h2 className="mt-6 mb-3 font-semibold">Colours</h2>
              <ul className="flex flex-wrap gap-2">
                {colours.map((colour) => (
                  <li
                    key={colour}
                    className="rounded border border-black px-2 py-1 text-xs"
                  >
                    {colour}
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className="min-w-0 flex-1 lg:overflow-y-auto lg:pr-2">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">
              This outfit has no items. They may have been removed from your
              wardrobe.
            </p>
          ) : (
            categories.map(({ category, items }) => (
              <section key={category}>
                <h2 className="mb-2 flex items-baseline gap-3">
                  {category}
                  <span className="text-xs text-gray-500">{items.length}</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <ClothingItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
