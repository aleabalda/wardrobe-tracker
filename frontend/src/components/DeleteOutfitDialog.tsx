export const DeleteOutfitDialog = ({
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: {
  isDeleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/50"
        onClick={() => {
          if (!isDeleting) onCancel();
        }}
      ></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-outfit-title"
        className="fixed transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-20 w-md max-w-[calc(100vw-2rem)] bg-white border border-black p-6 rounded shadow-lg flex flex-col gap-4"
      >
        <h2 id="delete-outfit-title" className="text-lg">
          Are you sure you want to delete this outfit?
        </h2>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-4 text-sm">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="cursor-pointer text-red-600 underline disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="cursor-pointer underline disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};
