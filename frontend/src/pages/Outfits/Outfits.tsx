import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteOutfit, fetchOutfits } from "../../api/outfits";
import type { Outfit } from "../../types/Outfit";
import { OutfitCard } from "../../components/OutfitCard";
import { ItemToolbar } from "../../components/ItemToolbar";
import { DeleteDialog } from "../../components/DeleteDialog";
import {
  EMPTY_FILTERS,
  OUTFIT_ITEM_FILTER_FIELDS,
  outfitMatchesFilters,
  type ItemFilters,
} from "../../utils/itemFilters";
import {
  OUTFIT_SORT_OPTIONS,
  compareOutfits,
  type OutfitSortOption,
} from "../../utils/sortOptions";
import { Toast } from "../../components/ui/Toast";
import { CategorySelector } from "../../components/CategorySelector";
import {
  ALL_OUTFITS,
  SEASON_OPTIONS,
  type SeasonOption,
} from "../../types/outfitSeasonOptions";

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
  const [sortOption, setSortOption] = useState<OutfitSortOption>("newest");
  const [filters, setFilters] = useState<ItemFilters>(EMPTY_FILTERS);
  const [activeSeason, setActiveSeason] = useState<SeasonOption>(ALL_OUTFITS);

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

  const seasonOutfits = outfits.filter(
    (outfit) =>
      activeSeason === ALL_OUTFITS || outfit.season.includes(activeSeason),
  );

  const filteredOutfits = seasonOutfits
    .filter((outfit) => outfitMatchesFilters(outfit, filters))
    .sort((a, b) => compareOutfits(a, b, sortOption));

  return (
    <div className="p-12 pt-6">
      <Toast message={toastMessage} onClose={closeToast} />
      <CategorySelector
        options={SEASON_OPTIONS}
        activeValue={activeSeason}
        onSelect={setActiveSeason}
        count={seasonOutfits.length}
        allNoun="Outfits"
      />
      <ItemToolbar
        items={seasonOutfits.flatMap((outfit) => outfit.items)}
        fields={OUTFIT_ITEM_FILTER_FIELDS}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredOutfits.length}
        resultNoun="Outfit"
        sortOptions={OUTFIT_SORT_OPTIONS}
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
      ) : seasonOutfits.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No {activeSeason} outfits yet.
        </p>
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
        <DeleteDialog
          noun="outfit"
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
