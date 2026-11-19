import { useState } from "react";
import { createListing } from "../../../api/listings";
import type { ClothingItem } from "../../../types/ClothingItems";
import { TextAreaField, TextField } from "../../ui/FormField";
import { PanelForm } from "./PanelForm";

/**
 * Lists an item for sale inside its page's side panel. The description starts
 * as a copy of the item's but is saved on the listing only
 */
export const CreateListingForm = ({
  item,
  onClose,
  onCreated,
}: {
  item: ClothingItem;
  onClose: () => void;
  onCreated: (listingId: number) => void;
}) => {
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>(
    item.description ?? "",
  );

  return (
    <PanelForm
      title="List for sale"
      submitLabel="List Item"
      canSubmit={price.trim() !== ""}
      onCancel={onClose}
      onSubmit={async () => {
        const { id } = await createListing(item.id, Number(price), description);
        onCreated(id);
      }}
    >
      <p className="col-span-2 -mt-2 mb-1 text-sm text-gray-500">
        {item.name}
        {item.brand && ` · ${item.brand}`}
      </p>
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
        Changing this description only changes the listing, not the item in your
        wardrobe.
      </p>
    </PanelForm>
  );
};
