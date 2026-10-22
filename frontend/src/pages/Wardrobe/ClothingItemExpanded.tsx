import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreateListingForm } from "../../components/CreateListingForm";
import { BlurredImage } from "../../components/ui/BlurredImage";

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
      <BlurredImage
        src={item.image_url}
        alt={item.name}
        className="h-full w-2/3 shadow-xl"
      />
      <div className="relative flex h-full w-1/3 flex-col gap-2">
        {/* Follow facebook marketplace format */}
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <h2 className="font-semibold">Details</h2>
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <p>Brand: {item.brand}</p>
          <p>Type: {item.type}</p>
          <p>Color: {item.color}</p>
          <p>Size: {item.size}</p>
        </div>

        <p className="">{item.description}</p>

        {item.price !== null && <p>${item.price}</p>}

        {error && <p className="text-red-600">{error}</p>}

        <div className="absolute bottom-0 left-0 flex gap-4">
          {item.is_for_sale ? (
            <p className="text-sm">Item is Listed For Sale</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsListingItem(true);
              }}
              className="cursor-pointer text-sm underline"
            >
              List for Sale
            </button>
          )}
          <button
            type="button"
            className="cursor-pointer text-sm underline"
            onClick={() => {
              navigate("/outfits/create-outfit", {
                state: { itemId: item.id },
              });
            }}
          >
            Create Outfit
          </button>
          <button type="button" className="cursor-pointer text-sm underline">
            Edit
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer text-sm underline"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
