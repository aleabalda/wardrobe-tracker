import { useState } from "react";
import { createListing } from "../api/listings";
import type { ClothingItem } from "../types/ClothingItems";
import { SubmitButton, TextField } from "./ui/FormField";

export const CreateListingForm = ({
  toggleForm,
  clothingItem,
  editError,
  onListingCreated,
}: {
  toggleForm: () => void;
  clothingItem: ClothingItem;
  editError: (error: string) => void;
  onListingCreated: (description: string, listingId: number) => void;
}) => {
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>(
    clothingItem.description ?? "",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { id } = await createListing(
        clothingItem.id,
        Number(price),
        description,
      );
      onListingCreated(description.trim(), id);
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
      className="z-10 absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 flex w-md max-w-[calc(100vw-2rem)] flex-col gap-3 bg-white border border-black p-6 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base">List Item</h2>
        <button
          type="button"
          onClick={toggleForm}
          className="cursor-pointer text-sm underline"
        >
          Cancel
        </button>
      </div>
      <TextField
        label="Price"
        hint="0.00"
        adornment="CAD"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        required
        value={price}
        onChange={(e) => {
          setPrice(e.target.value);
        }}
      />
      <TextField
        label="Description"
        hint="Describe the item's condition"
        optional
        type="text"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
      />
      <SubmitButton>List Item</SubmitButton>
    </form>
  );
};
