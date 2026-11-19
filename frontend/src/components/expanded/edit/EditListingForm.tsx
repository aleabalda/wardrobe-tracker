import { useState } from "react";
import { updateListing } from "../../../api/listings";
import type { ListingDetail } from "../../../types/ListingItem";
import type { ListingStatus } from "../../../utils/listingStatus";
import { TextAreaField, TextField } from "../../ui/FormField";
import { ItemFields, ListingStatusSelect } from "./ItemFields";
import { hasRequiredItemFields, toItemFieldValues } from "./itemFieldValues";
import { FormSection, PanelForm } from "./PanelForm";

/**
 * Edits the seller's own listing inside its page's side panel: the item's
 * details (shared with their wardrobe) and the listing's price, status and
 * description (which are the listing's alone)
 */
export const EditListingForm = ({
  listing,
  onClose,
  onSaved,
}: {
  listing: ListingDetail;
  onClose: () => void;
  onSaved: (listing: ListingDetail) => void;
}) => {
  const [fields, setFields] = useState(() => toItemFieldValues(listing));
  const [price, setPrice] = useState<string>(
    listing.price === null ? "" : String(listing.price),
  );
  const [status, setStatus] = useState<ListingStatus>(listing.status);
  const [description, setDescription] = useState<string>(
    listing.description ?? "",
  );

  return (
    <PanelForm
      title="Edit listing"
      canSubmit={hasRequiredItemFields(fields) && price.trim() !== ""}
      onCancel={onClose}
      onSubmit={async () => {
        onSaved(
          await updateListing(listing.id, {
            ...fields,
            price: Number(price),
            status,
            description,
          }),
        );
      }}
    >
      <FormSection title="Listing" />
      <TextField
        label="Price"
        autoFocus
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
      <ListingStatusSelect value={status} onChange={setStatus} className="" />
      <TextAreaField
        label="Listing description"
        hint="Condition, fit, why you're selling"
        optional
        className="col-span-2"
        rows={4}
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
      />

      <FormSection
        title="Item details"
        note="These are shared with the item in your wardrobe, so changing them here changes it there too."
      />
      <ItemFields values={fields} onChange={setFields} autoFocus={false} />
    </PanelForm>
  );
};
