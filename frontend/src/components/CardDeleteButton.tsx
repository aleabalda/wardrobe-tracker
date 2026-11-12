/**
 * "Delete" label in the top right of a card's image. Put it inside a
 * `group relative` wrapper: it shows on hover, on keyboard focus, and
 * always on touch screens.
 */
export const CardDeleteButton = ({
  label,
  onClick,
}: {
  /** Accessible name, e.g. "Delete Blue Jeans" */
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="absolute right-2 top-2 cursor-pointer rounded bg-white px-2 py-1 text-xs opacity-0 shadow transition-opacity duration-150 hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
  >
    Delete
  </button>
);
