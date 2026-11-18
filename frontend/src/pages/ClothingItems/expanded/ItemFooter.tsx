import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteClothingItem } from "../../../api/wardrobe";
import { DeleteDialog } from "../../../components/DeleteDialog";

/** List for Sale, Edit and Delete, pinned to the bottom of the panel */
export const ItemFooter = ({
  itemId,
  canList,
  onList,
}: {
  itemId: number;
  /** False once the item has been listed */
  canList: boolean;
  onList: () => void;
}) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await deleteClothingItem(String(itemId));
      navigate("/wardrobe");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete clothing item.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-4 border-t border-gray-200 p-5 text-sm">
      {isDeleteDialogOpen && (
        <DeleteDialog
          noun="item"
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={() => {
            void handleDelete();
          }}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setDeleteError(null);
          }}
        />
      )}

      {canList && (
        <button
          type="button"
          onClick={onList}
          className="cursor-pointer underline"
        >
          List for Sale
        </button>
      )}
      <button type="button" className="cursor-pointer underline">
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          setIsDeleteDialogOpen(true);
        }}
        className="cursor-pointer text-red-600 underline"
      >
        Delete
      </button>
    </div>
  );
};
