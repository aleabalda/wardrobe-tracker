import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchClothingItems } from "../api/wardrobe";
import { createListing } from "../api/listings";
import type { ClothingItem } from "../types/ClothingItems";
import { matchesSearch } from "../utils/itemFilters";
import { SubmitButton, TextAreaField, TextField } from "./ui/FormField";

/**
 * Slides in from the right on the listings page: pick an item from the
 * wardrobe (searchable), then set its price and listing description
 */
export const CreateNewListingForm = ({
  onClose,
  onCreated,
  listedItemIds,
}: {
  onClose: () => void;
  onCreated: (listingId: number) => void;
  /** Items that already have an active or pending listing */
  listedItemIds: Set<number>;
}) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setItems(await fetchClothingItems());
      } catch (error) {
        console.error("Unable to load clothing items:", error);
        setLoadError("Unable to load your wardrobe.");
      } finally {
        setIsLoadingItems(false);
      }
    };

    void loadItems();
  }, []);

  const matchingItems = useMemo(
    () => items.filter((item) => matchesSearch(item, search)),
    [items, search],
  );

  const selectItem = (item: ClothingItem) => {
    setSelected(item);
    setPrice("");
    setDescription(item.description ?? "");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const { id } = await createListing(
        selected.id,
        Number(price),
        description,
      );
      onCreated(id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create listing.",
      );
      setIsSaving(false);
    }
  };

  // stays open while saving so it can't be dismissed halfway through
  const handleClose = () => {
    if (!isSaving) onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleClose}
        className="fixed inset-0 z-30 bg-black/50"
      />
      <motion.form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-listing-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-y-0 right-0 z-40 flex w-122 max-w-full flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 id="create-listing-title" className="text-base">
            {selected ? "List for Sale" : "Create Listing"}
          </h2>
          {!isSaving && (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-sm underline"
            >
              Cancel
            </button>
          )}
        </div>

        {selected ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                }}
                disabled={isSaving}
                className="mb-4 flex cursor-pointer items-center gap-1 text-xs underline disabled:cursor-not-allowed"
              >
                <ArrowBackIcon sx={{ fontSize: 14 }} />
                Choose a different item
              </button>
              <div className="mb-5 flex items-center gap-3">
                <img
                  src={selected.image_url}
                  alt=""
                  className="h-20 aspect-11/15 object-cover"
                />
                <div className="min-w-0 text-sm">
                  <p className="truncate">{selected.name}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {[selected.brand, selected.size && `Size ${selected.size}`]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Price"
                  hint="0.00"
                  adornment="CAD"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="col-span-2"
                  autoFocus
                  required
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                  }}
                />
                <TextAreaField
                  label="Listing description"
                  hint="Condition, fit, why you're selling"
                  optional
                  className="col-span-2"
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
                <p className="col-span-2 text-xs text-gray-500">
                  Changing this description only changes the listing, not the
                  item in your wardrobe.
                </p>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
            <div className="px-6 py-4">
              <SubmitButton disabled={isSaving || price.trim() === ""}>
                {isSaving ? "Listing Item..." : "List Item"}
              </SubmitButton>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pb-3">
              <TextField
                label="Search your wardrobe"
                hint="Name, brand, type or colour"
                type="search"
                autoFocus
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                // Enter shouldn't submit the form from the search box
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
              {isLoadingItems ? (
                <p className="text-sm text-gray-500">
                  Loading your wardrobe...
                </p>
              ) : loadError ? (
                <p className="text-sm text-red-600">{loadError}</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Your wardrobe is empty. Add an item to your wardrobe first.
                </p>
              ) : matchingItems.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No items match "{search.trim()}".
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-x-2 gap-y-4">
                  {matchingItems.map((item) => {
                    const isListed = listedItemIds.has(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={isListed}
                          onClick={() => {
                            selectItem(item);
                          }}
                          aria-label={
                            isListed
                              ? `${item.name} (already listed)`
                              : `List ${item.name}`
                          }
                          className="group block w-full cursor-pointer text-left disabled:cursor-not-allowed"
                        >
                          <div className="relative border border-transparent p-0.5 transition-colors group-hover:border-black group-focus-visible:border-black group-disabled:border-transparent">
                            <img
                              src={item.image_url}
                              alt=""
                              loading="lazy"
                              className={`block w-full aspect-11/15 object-cover ${
                                isListed ? "opacity-40" : ""
                              }`}
                            />
                            {isListed && (
                              <span className="absolute left-1.5 top-1.5 bg-white px-1.5 py-0.5 text-[10px]">
                                Listed
                              </span>
                            )}
                          </div>
                          <p
                            className={`truncate px-1 pt-1.5 text-xs ${
                              isListed ? "text-gray-400" : ""
                            }`}
                          >
                            {item.name}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </motion.form>
    </>
  );
};
