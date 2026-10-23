import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import {
  deleteOutfit,
  fetchOutfits,
  updateOutfitFavourite,
} from "../../api/outfits";
import type { Outfit } from "../../types/Outfit";
import { Toast } from "../../components/ui/Toast";

export const Outfits = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // the outfit awaiting delete confirmation, and the one being deleted
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingFavouriteIds, setUpdatingFavouriteIds] = useState<number[]>(
    [],
  );

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

  const setOutfitFavourite = (id: number, isFavourite: boolean) => {
    setOutfits((current) =>
      current.map((outfit) =>
        outfit.id === id ? { ...outfit, is_favourite: isFavourite } : outfit,
      ),
    );
  };

  const handleFavourite = async (outfit: Outfit) => {
    if (updatingFavouriteIds.includes(outfit.id)) return;

    const newValue = !outfit.is_favourite;

    setOutfitFavourite(outfit.id, newValue);
    setUpdatingFavouriteIds((current) => [...current, outfit.id]);

    try {
      const savedValue = await updateOutfitFavourite(outfit.id, newValue);
      setOutfitFavourite(outfit.id, savedValue);
    } catch (error) {
      console.error("Failed to update favourite:", error);
      // Revert optimistic update
      setOutfitFavourite(outfit.id, !newValue);
    } finally {
      setUpdatingFavouriteIds((current) =>
        current.filter((id) => id !== outfit.id),
      );
    }
  };

  // stable so the toast's auto-dismiss timer isn't reset on every render
  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <div className="p-12 pt-6">
      <Toast message={toastMessage} onClose={closeToast} />
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-4xl">Outfits</h1>
        <button
          type="button"
          className="cursor-pointer underline text-sm"
          onClick={() => {
            navigate("/outfits/create-outfit");
          }}
        >
          Create Outfit
        </button>
      </div>
      <div className="w-full h-px rounded bg-black mb-4"></div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading outfits...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : outfits.length === 0 ? (
        <p className="text-sm text-gray-500">No outfits yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {outfits.map((outfit) => (
            <section key={outfit.id}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    <Link
                      to={`/outfits/${outfit.id}`}
                      className="hover:underline"
                    >
                      {outfit.name ?? "Untitled Outfit"}
                    </Link>
                  </h2>
                  <p className="text-xs text-gray-500">
                    {outfit.items.length}{" "}
                    {outfit.items.length === 1 ? "item" : "items"}
                  </p>
                  <IconButton
                    aria-label={
                      outfit.is_favourite
                        ? "Remove outfit from favourites"
                        : "Add outfit to favourites"
                    }
                    disabled={updatingFavouriteIds.includes(outfit.id)}
                    onClick={() => {
                      void handleFavourite(outfit);
                    }}
                  >
                    {outfit.is_favourite ? (
                      <BookmarkIcon fontSize="small" />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingId(outfit.id);
                    setDeleteError(null);
                  }}
                  className="cursor-pointer text-xs hover:underline"
                >
                  Delete
                </button>
              </div>
              {outfit.description && (
                <p className="mb-2 text-sm text-gray-600">
                  {outfit.description}
                </p>
              )}
              <div className="flex gap-4">
                {outfit.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/wardrobe/${item.id}`}
                    className="group w-32 shrink-0"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="mb-1 block w-full aspect-9/16 object-cover group-hover:outline-1 group-hover:outline-black"
                    />
                    <p className="truncate text-sm">{item.name}</p>
                    <p className="truncate text-xs text-gray-600">
                      {item.type}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {confirmingId !== null && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/50"
            onClick={() => {
              if (deletingId === null) setConfirmingId(null);
            }}
          ></div>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-outfit-title"
            className="fixed transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-20 w-md max-w-[calc(100vw-2rem)] bg-white border border-black p-6 rounded shadow-lg flex flex-col gap-4"
          >
            <h2 id="delete-outfit-title" className="text-lg">
              Are you sure you want to delete this outfit?
            </h2>
            {deleteError && (
              <p className="text-xs text-red-600">{deleteError}</p>
            )}
            <div className="flex justify-end gap-4 text-sm">
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => {
                  void handleDelete(confirmingId);
                }}
                className="cursor-pointer text-red-600 underline disabled:cursor-not-allowed"
              >
                {deletingId !== null ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() => {
                  setConfirmingId(null);
                }}
                className="cursor-pointer underline disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
