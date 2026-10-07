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
          onListingCreated={(description) => {
            setItem({ ...item, description, is_for_sale: true });
          }}
        />
      )}
      <img
        src={item.image_url}
        alt={item.name}
        className="h-full w-1/2 rounded border-black border object-cover"
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
            type="button"
            onClick={() => {
              setIsListingItem(true);
            }}
            disabled={item.is_for_sale}
            aria-disabled={item.is_for_sale}
            title={
              item.is_for_sale
                ? "This item is already listed for sale"
                : undefined
            }
            className="border border-black rounded px-4 py-2 font-semibold transition-all ease-in-out enabled:cursor-pointer enabled:hover:bg-black enabled:hover:text-white disabled:cursor-not-allowed disabled:border-dashed disabled:border-gray-400 disabled:bg-gray-200 disabled:text-gray-500"
          >
            {item.is_for_sale
              ? "Already Listed For Sale"
              : "List Item For Sale"}
          </button>
          <button className="cursor-pointer border border-black hover:bg-black hover:text-white rounded px-4 py-2 font-semibold transition-all ease-in-out">
            Edit
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer border border-red-600 hover:bg-red-600 hover:text-white rounded px-4 py-2 font-semibold transition-all ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
