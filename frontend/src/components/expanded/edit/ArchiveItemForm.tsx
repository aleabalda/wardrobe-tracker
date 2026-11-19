import { useState } from "react";
import { archiveClothingItem } from "../../../api/wardrobe";
import type { ClothingItem } from "../../../types/ClothingItems";
import {
  ARCHIVE_REASONS,
  type ArchiveReason,
} from "../../../utils/archiveReasons";
import { PanelForm } from "./PanelForm";

const outfitsText = (count: number) =>
  count === 1 ? "the 1 outfit it's in" : `the ${count} outfits it's in`;

/**
 * Asks why an item is gone before moving it to past items, inside its page's
 * side panel. Unlike deleting, it stays in its outfits and can be restored
 */
export const ArchiveItemForm = ({
  item,
  onClose,
  onArchived,
}: {
  item: ClothingItem;
  onClose: () => void;
  onArchived: (item: ClothingItem) => void;
}) => {
  const [reason, setReason] = useState<ArchiveReason | null>(
    item.listing_status === "sold" ? "sold" : null,
  );
  const outfitCount = item.outfit_count ?? 0;
  const hasOpenListing =
    item.listing_status === "active" || item.listing_status === "pending";

  return (
    <PanelForm
      title="Remove from wardrobe?"
      submitLabel="Remove Item"
      submittingLabel="Removing..."
      canSubmit={reason !== null}
      onCancel={onClose}
      onSubmit={async () => {
        if (reason) onArchived(await archiveClothingItem(item.id, reason));
      }}
    >
      <fieldset className="col-span-2">
        <legend className="mb-2 text-sm">
          Why is <span className="font-medium">{item.name}</span> leaving your
          wardrobe?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {ARCHIVE_REASONS.map(({ value, label }) => (
            <label
              key={value}
              className={`flex h-12 cursor-pointer items-center gap-2 border px-3 text-sm transition-colors has-focus-visible:ring-1 has-focus-visible:ring-black ${
                reason === value
                  ? "border-black bg-black text-white"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              <input
                type="radio"
                name="archive-reason"
                value={value}
                checked={reason === value}
                onChange={() => {
                  setReason(value);
                }}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <ul className="col-span-2 mt-2 space-y-1 text-xs text-gray-500">
        <li>It moves to Past items in your wardrobe.</li>
        {outfitCount > 0 && (
          <li>
            It stays in {outfitsText(outfitCount)}, marked as no longer owned.
          </li>
        )}
        {hasOpenListing && <li>Its listing will be taken down.</li>}
        <li>You can restore it any time.</li>
      </ul>
    </PanelForm>
  );
};
