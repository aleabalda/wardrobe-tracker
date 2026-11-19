/** List for Sale, Edit and Delete, pinned to the bottom of the panel */
export const ItemFooter = ({
  canList,
  onList,
  onEdit,
  onDelete,
}: {
  /** False once the item has been listed */
  canList: boolean;
  onList: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="flex gap-4 border-t border-gray-200 p-5 text-sm">
    {canList && (
      <button
        type="button"
        onClick={onList}
        className="cursor-pointer underline"
      >
        List for Sale
      </button>
    )}
    <button type="button" onClick={onEdit} className="cursor-pointer underline">
      Edit
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="cursor-pointer text-red-600 underline"
    >
      Delete
    </button>
  </div>
);
