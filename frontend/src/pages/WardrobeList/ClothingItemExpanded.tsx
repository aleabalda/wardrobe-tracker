import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateListingForm } from "../../components/CreateListingForm";

import type { ClothingItem } from "../../types/ClothingItems";
import { deleteClothingItem, fetchClothingItemById } from "../../api/wardrobe";

export const ClothingItemExpanded = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isListingItem, setIsListingItem] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setError("No clothing item ID was provided.");
      return;
    }

    const loadItem = async () => {
      try {
        setError(null);

        const clothingItem = await fetchClothingItemById(id);
        setItem(clothingItem);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load clothing item.",
        );
      }
    };

    void loadItem();
  }, [id]);

  const editError = (error: string) => {
    setError(error);
  };

  const handleDelete = async () => {
    if (!id || isDeleting) return;

    try {
      setIsDeleting(true);
      setError(null);

      await deleteClothingItem(id);
      navigate("/wardrobe");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete clothing item.",
      );

      setIsDeleting(false);
    }
  };

  if (error && !item) {
    return <p className="p-4">{error}</p>;
  }

  if (!item) {
    return <p className="p-4">Loading item...</p>;
  }

  const toggleForm = () => {
    setIsListingItem(!isListingItem);
  };

  return (
    <div className="flex h-full gap-3 p-4">
      {isListingItem && (
        <CreateListingForm
          clothingItem={item}
          toggleForm={toggleForm}
          editError={editError}
        />
      )}
      <img
        src={item.image_url}
        alt={item.name}
        className="h-full w-1/2 rounded object-cover"
      />

      <div className="relative flex h-full w-1/2 flex-col gap-2">
        <h1 className="text-5xl font-bold">{item.name}</h1>

        <p className="text-xl">
          {item.brand} | {item.type} | {item.color} | Size {item.size}
        </p>

        <p>{item.description}</p>

        {item.price !== null && <p>${item.price}</p>}

        {error && <p className="text-red-600">{error}</p>}

        <div className="absolute bottom-0 left-0 flex gap-3">
          <button
            onClick={() => {
              setIsListingItem(true);
            }}
            disabled={item.is_for_sale}
            className={`cursor-pointer rounded disabled:bg-gray-300 opacity-75 bg-green-300 px-4 py-2 font-semibold transition-all ease-in-out hover:bg-green-400`}
          >
            {item.is_for_sale ? "Listed For Sale" : "List Item For Sale"}
          </button>
          <button className="cursor-pointer rounded bg-blue-300 px-4 py-2 font-semibold transition-all ease-in-out hover:bg-blue-400">
            Edit
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer rounded bg-red-300 px-4 py-2 font-semibold transition-all ease-in-out hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
