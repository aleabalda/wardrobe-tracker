import { useState, type FormEvent, type ReactNode } from "react";
import { SubmitButton } from "../../ui/FormField";

/**
 * A form that fills a detail page's side panel: a heading and fields that
 * scroll, with Save and Cancel pinned where the footer bar sits. `onSubmit`
 * throws to show its message under the fields
 */
export const PanelForm = ({
  title,
  canSubmit,
  onSubmit,
  onCancel,
  submitLabel = "Save Changes",
  submittingLabel = "Saving...",
  isDanger = false,
  children,
}: {
  title: string;
  /** The button's text, e.g. "List Item" */
  submitLabel?: string;
  /** The button's text while submitting, e.g. "Deleting..." */
  submittingLabel?: string;
  /** Red button for something that can't be undone, like deleting */
  isDanger?: boolean;
  /** False while a required field is blank */
  canSubmit: boolean;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  children: ReactNode;
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      await onSubmit();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save your changes.",
      );
      setIsSaving(false);
    }
  };

  // stays open while saving so it can't be dismissed halfway through
  const handleCancel = () => {
    if (!isSaving) onCancel();
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleCancel();
      }}
      aria-labelledby="panel-form-title"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-1 overflow-y-auto overscroll-contain p-5">
        <h1
          id="panel-form-title"
          className="mb-4 text-2xl font-semibold leading-tight"
        >
          {title}
        </h1>
        <div className="grid grid-cols-2 gap-3">{children}</div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex items-center gap-4 border-t border-gray-200 p-5">
        {isDanger ? (
          <button
            type="submit"
            disabled={isSaving || !canSubmit}
            className="h-13.5 flex-1 cursor-pointer border border-red-600 bg-red-600 text-sm text-white transition-colors hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? submittingLabel : submitLabel}
          </button>
        ) : (
          <SubmitButton disabled={isSaving || !canSubmit} className="flex-1">
            {isSaving ? submittingLabel : submitLabel}
          </SubmitButton>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="cursor-pointer text-sm underline disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/** A small heading that starts a group of fields, e.g. "Listing" */
export const FormSection = ({
  title,
  note,
}: {
  title: string;
  /** A line under the heading, e.g. what the fields affect */
  note?: string;
}) => (
  <div className="col-span-2 mt-4">
    <h2 className="text-sm font-medium">{title}</h2>
    {note && <p className="mt-0.5 text-xs text-gray-500">{note}</p>}
  </div>
);
