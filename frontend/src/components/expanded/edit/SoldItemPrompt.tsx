import { archiveClothingItem } from "../../../api/wardrobe";
import { PanelForm } from "./PanelForm";

/**
 * Shown after the seller marks a listing as sold: offers to move the item to
 * their past items, since they no longer own it
 */
export const SoldItemPrompt = ({
  itemId,
  itemName,
  onClose,
  onArchived,
}: {
  itemId: number;
  itemName: string;
  onClose: () => void;
  onArchived: () => void;
}) => (
  <PanelForm
    title="Sold! Remove it from your wardrobe?"
    submitLabel="Move to Past Items"
    submittingLabel="Moving..."
    cancelLabel="Keep in Wardrobe"
    canSubmit
    onCancel={onClose}
    onSubmit={async () => {
      await archiveClothingItem(itemId, "sold");
      onArchived();
    }}
  >
    <div className="col-span-2 space-y-3 text-sm leading-relaxed">
      <p>
        <span className="font-medium">{itemName}</span> is marked as sold. You
        can move it out of your wardrobe and into Past items.
      </p>
      <p className="text-gray-500">
        It will stay in any outfits it's part of, labelled Sold, and you can
        restore it any time.
      </p>
    </div>
  </PanelForm>
);
