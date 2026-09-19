import { useState } from "react";
import { createListing } from "../api/listings";
import type { ClothingItem } from "../types/ClothingItems";

export const CreateListingForm = ({
  toggleForm,
  clothingItem,
  editError,
}: {
  toggleForm: () => void;
  clothingItem: ClothingItem;
  editError: (error: string) => void;
}) => {
  const [price, setPrice] = useState<number>(0);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await createListing(clothingItem.id, price);
      toggleForm();
    } catch (error) {
      editError(
        error instanceof Error ? error.message : "Unable to create listing.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="z-10 absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white border border-black p-6 rounded shadow-lg flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold">List Item</h2>
      <input
        id="price-input"
        value={price}
        type="number"
        placeholder="Price (CAD)"
        required
        onChange={(e: any) => {
          setPrice(e.target.value);
        }}
        className="p-3 rounded outline-1 outline-gray-400"
      />
      <input
        id="description-input"
        type="text"
        placeholder="Description"
        className="p-3 rounded outline-1 outline-gray-400"
      />
      <label htmlFor="price-input" className="hidden"></label>
      <div className="flex gap-2">
        <button className="cursor-pointer rounded bg-green-300 w-1/2 py-2 font-semibold transition-all ease-in-out hover:bg-green-400">
          Submit
        </button>
        <button
          onClick={toggleForm}
          className="cursor-pointer rounded bg-red-300 w-1/2 py-2 font-semibold transition-all ease-in-out hover:bg-red-400"
        >
          Exit
        </button>
      </div>
    </form>
  );
};
