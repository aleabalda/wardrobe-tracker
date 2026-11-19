import { useState } from "react";
import { updateClothingItem } from "../../../api/wardrobe";
import type { ClothingItem } from "../../../types/ClothingItems";
import { TextAreaField } from "../../ui/FormField";
import { ItemFields } from "./ItemFields";
import { hasRequiredItemFields, toItemFieldValues } from "./itemFieldValues";
import { PanelForm } from "./PanelForm";

/**
 * Edits an item's details inside its page's side panel. A listed item's
 * status is changed from its listing instead
 */
export const EditItemForm = ({
  item,
  onClose,
  onSaved,
}: {
  item: ClothingItem;
  onClose: () => void;
  onSaved: (item: ClothingItem) => void;
}) => {
  const [fields, setFields] = useState(() => toItemFieldValues(item));
  const [description, setDescription] = useState<string>(
    item.description ?? "",
  );

  return (
    <PanelForm
      title="Edit item"
      canSubmit={hasRequiredItemFields(fields)}
      onCancel={onClose}
      onSubmit={async () => {
        onSaved(
          await updateClothingItem(item.id, {
            ...fields,
            description,
          }),
        );
      }}
    >
      <ItemFields values={fields} onChange={setFields} />
      <TextAreaField
        label="Description"
        optional
        className="col-span-2"
        rows={4}
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
      />
    </PanelForm>
  );
};
