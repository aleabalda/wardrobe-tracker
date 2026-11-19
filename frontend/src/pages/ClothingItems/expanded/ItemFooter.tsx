/**
 * The item's actions, pinned to the bottom of the panel: List for Sale, Edit
 * and Remove for items in the wardrobe; Restore and Delete for past items
 */
export const ItemFooter = ({
  isArchived,
  canList,
  isRestoring,
  onList,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  /** True for a past item, i.e. no longer in the wardrobe */
  isArchived: boolean;
  /** False once the item has been listed */
  canList: boolean;
  isRestoring: boolean;
  onList: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) => (
  <div className="flex gap-4 border-t border-gray-200 p-5 text-sm">
    {isArchived ? (
      <>
        <button
          type="button"
          onClick={onRestore}
          disabled={isRestoring}
          className="cursor-pointer underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRestoring ? "Restoring..." : "Restore to Wardrobe"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isRestoring}
          className="cursor-pointer text-red-600 underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete Forever
        </button>
      </>
    ) : (
      <>
        {canList && (
          <button
            type="button"
            onClick={onList}
            className="cursor-pointer underline"
          >
            List for Sale
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="cursor-pointer underline"
        >
          Remove from Wardrobe
        </button>
      </>
    )}
  </div>
);
