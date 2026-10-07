import { useState } from "react";
import { createListing } from "../api/listings";
import type { ClothingItem } from "../types/ClothingItems";

export const CreateListingForm = ({
  toggleForm,
  clothingItem,
  editError,
  onListingCreated,
}: {
  toggleForm: () => void;
  clothingItem: ClothingItem;
  editError: (error: string) => void;
  onListingCreated: (description: string) => void;
}) => {
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>(
    clothingItem.description ?? "",
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await createListing(clothingItem.id, Number(price), description);
      onListingCreated(description.trim());
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
      <div className="flex flex-col gap-1">
        <label htmlFor="price-input" className="text-sm font-semibold">
          Price
        </label>
        <div className="flex items-center rounded outline-1 outline-gray-400 focus-within:outline-2 focus-within:outline-black">
          <span className="pl-3 text-gray-500 font-semibold">$</span>
          <input
            id="price-input"
            value={price}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            onChange={(e: any) => {
              setPrice(e.target.value);
            }}
            className="w-full p-3 pl-1 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pr-3 text-sm text-gray-500">CAD</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="description-input" className="text-sm font-semibold">
          Description
        </label>
        <div className="flex items-center rounded outline-1 outline-gray-400 focus-within:outline-2 focus-within:outline-black">
          <input
            id="description-input"
            value={description}
            type="text"
            placeholder="Describe the item's condition"
            onChange={(e: any) => {
              setDescription(e.target.value);
            }}
            className="w-full p-3 outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="cursor-pointer rounded border border-black hover:bg-black hover:text-white w-1/2 py-2 font-semibold transition-all ease-in-out">
          Submit
        </button>
        <button
          type="button"
          onClick={toggleForm}
          className="cursor-pointer rounded w-1/2 py-2 font-semibold transition-all ease-in-out border border-red-600 hover:text-white hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
