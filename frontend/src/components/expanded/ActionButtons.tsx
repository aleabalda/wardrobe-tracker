import type { ReactNode } from "react";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";

const iconButtonClass =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center border border-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

/** The row under the header: a main action, then the icon buttons */
export const ActionRow = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 flex gap-2">{children}</div>
);

export const SaveButton = ({
  isSaved,
  isUpdating,
  onToggle,
  noun,
}: {
  isSaved: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  /** e.g. "item", as in "Save item" */
  noun: string;
}) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={isUpdating}
    aria-label={isSaved ? `Remove from saved ${noun}s` : `Save ${noun}`}
    aria-pressed={isSaved}
    title={isSaved ? "Saved" : "Save"}
    className={iconButtonClass}
  >
    {isSaved ? (
      <BookmarkIcon fontSize="small" />
    ) : (
      <BookmarkBorderIcon fontSize="small" />
    )}
  </button>
);

/** Copies the current page's URL */
export const ShareButton = ({
  noun,
  onCopied,
  onError,
}: {
  noun: string;
  onCopied: () => void;
  onError: () => void;
}) => (
  <button
    type="button"
    onClick={() => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(onCopied, (error: unknown) => {
          console.error("Unable to copy link:", error);
          onError();
        });
    }}
    aria-label={`Copy link to ${noun}`}
    title="Copy link"
    className={iconButtonClass}
  >
    <ShareOutlinedIcon fontSize="small" />
  </button>
);
