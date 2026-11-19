import { useNavigate } from "react-router-dom";
import { deleteClothingItem } from "../../../api/wardrobe";
import type { ClothingItem } from "../../../types/ClothingItems";
import { PanelForm } from "./PanelForm";

/**
 * Asks before deleting an item, inside its page's side panel. Deleting also
 * takes down its listing and removes it from outfits (the database cascades)
 */
export const DeleteItemForm = ({
  item,
  onClose,
}: {
  item: ClothingItem;
  onClose: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <PanelForm
      title="Delete item?"
      submitLabel="Delete Item"
      submittingLabel="Deleting..."
      isDanger
      canSubmit
      onCancel={onClose}
      onSubmit={async () => {
        await deleteClothingItem(String(item.id));
        void navigate("/wardrobe");
      }}
    >
      <div className="col-span-2 space-y-3 text-sm leading-relaxed">
        <p>
          <span className="font-medium">{item.name}</span> will be permanently
          deleted from your wardrobe, along with its photo. This can't be
          undone.
        </p>
        <ul className="text-gray-500 space-y-1 pl-5">
          <li>It will be removed from any outfits it's in.</li>
          {item.listing_id && (
            <li>
              Its listing will be taken down and removed from anyone's saved
              listings.
            </li>
          )}
        </ul>
      </div>
    </PanelForm>
  );
};
