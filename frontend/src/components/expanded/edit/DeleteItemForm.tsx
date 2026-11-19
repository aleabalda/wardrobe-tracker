import { useNavigate } from "react-router-dom";
import { deleteClothingItem } from "../../../api/wardrobe";
import type { ClothingItem } from "../../../types/ClothingItems";
import { PanelForm } from "./PanelForm";

/**
 * Asks before permanently deleting a past item, inside its page's side panel.
 * Deleting also removes it from outfits and takes its listings with it (the
 * database cascades), which is why only past items can be deleted
 */
export const DeleteItemForm = ({
  item,
  onClose,
}: {
  item: ClothingItem;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const outfitCount = item.outfit_count ?? 0;

  return (
    <PanelForm
      title="Delete forever?"
      submitLabel="Delete Item"
      submittingLabel="Deleting..."
      isDanger
      canSubmit
      onCancel={onClose}
      onSubmit={async () => {
        await deleteClothingItem(item.id);
        void navigate("/wardrobe?view=past");
      }}
    >
      <div className="col-span-2 space-y-3 text-sm leading-relaxed">
        <p>
          <span className="font-medium">{item.name}</span> will be permanently
          deleted, along with its photo. This can't be undone.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-gray-500">
          {outfitCount > 0 && (
            <li className="text-red-600">
              It will disappear from{" "}
              {outfitCount === 1
                ? "the 1 outfit it's in"
                : `the ${outfitCount} outfits it's in`}
              .
            </li>
          )}
          {item.listing_id && (
            <li>
              Its listing, and any messages about it, will be deleted too.
            </li>
          )}
        </ul>
        <p className="text-gray-500">
          To keep it in your outfits, leave it in Past items instead.
        </p>
      </div>
    </PanelForm>
  );
};
