import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteOutfit, fetchOutfits } from "../../api/outfits";
import type { Outfit } from "../../types/Outfit";
import { OutfitCard } from "../../components/OutfitCard";
import { ItemToolbar } from "../../components/ItemToolbar";
import { DeleteOutfitDialog } from "../../components/DeleteOutfitDialog";
import {
  EMPTY_FILTERS,
  FILTER_FIELDS,
  countActiveFilters,
  matchesFilters,
  type ItemFilters,
} from "../../utils/itemFilters";
import { Toast } from "../../components/ui/Toast";

// size isn't meaningful for a whole outfit
const OUTFIT_FILTER_FIELDS = FILTER_FIELDS.filter(({ key }) => key !== "size");

const SORT_OPTIONS = [
  { value: "newest", label: "Recently created" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "most-items", label: "Most items" },
  { value: "fewest-items", label: "Fewest items" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// ids are auto-incremented, so they follow creation order
const compareOutfits = (a: Outfit, b: Outfit, sort: SortOption) => {
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

export const Outfits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // the outfit awaiting delete confirmation, and the one being deleted
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // the expanded view passes a message along after deleting an outfit
  const [toastMessage, setToastMessage] = useState<string | null>(
    location.state?.toastMessage ?? null,
  );
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);

  // cleared from history so the message doesn't return on refresh
  useEffect(() => {
    if (location.state?.toastMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const result = await fetchOutfits();
        setOutfits(result);
      } catch (error) {
        console.error("Unable to load outfits:", error);
        setError("Unable to load your outfits.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOutfits();
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteOutfit(id);
      setOutfits(outfits.filter((outfit) => outfit.id !== id));
      setConfirmingId(null);
      setToastMessage("Outfit was deleted successfully!");
    } catch (error) {
      console.error("Unable to delete outfit:", error);
      setDeleteError("Unable to delete outfit.");
    } finally {
      setDeletingId(null);
    }
  };

  // stable so the toast's auto-dismiss timer isn't reset on every render
  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // an outfit matches when at least one of its items matches the filters
  const filteredOutfits = outfits
    .filter(
      (outfit) =>
        countActiveFilters(filters) === 0 ||
        outfit.items.some((item) => matchesFilters(item, filters)),
    )
    .sort((a, b) => compareOutfits(a, b, sortOption));

  return (
    <div className="p-12 pt-6">
      <Toast message={toastMessage} onClose={closeToast} />
      <h2 className="mb-4 text-5xl">Outfits</h2>
      <ItemToolbar
        items={outfits.flatMap((outfit) => outfit.items)}
        fields={OUTFIT_FILTER_FIELDS}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredOutfits.length}
        resultNoun="Outfit"
        sortOptions={SORT_OPTIONS}
        sortValue={sortOption}
        onSortChange={setSortOption}
        action={
          <button
            type="button"
            onClick={() => {
              navigate("/outfits/create-outfit");
            }}
            className="cursor-pointer border border-black bg-black px-2 py-1 text-xs text-white transition-colors hover:bg-white hover:text-black"
          >
            Create Outfit
          </button>
        }
      />

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading outfits...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : outfits.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No outfits yet.</p>
      ) : filteredOutfits.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No outfits match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 mt-4">
          {filteredOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onDelete={() => {
                setConfirmingId(outfit.id);
                setDeleteError(null);
              }}
            />
          ))}
        </div>
      )}

      {confirmingId !== null && (
        <DeleteOutfitDialog
          isDeleting={deletingId !== null}
          error={deleteError}
          onConfirm={() => {
            void handleDelete(confirmingId);
          }}
          onCancel={() => {
            setConfirmingId(null);
          }}
        />
      )}
    </div>
  );
};
