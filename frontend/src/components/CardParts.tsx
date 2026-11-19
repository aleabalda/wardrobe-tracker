import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";

// The pieces every grid card (items, listings, outfits) is built from, so they
// look the same and only differ in what they show

/** Outer wrapper that spaces cards apart in a grid */
export const Card = ({ children }: { children: ReactNode }) => (
  <div className="mb-10">{children}</div>
);

/** A small white label in a corner of a card's image, e.g. "Sold" */
export const CardBadge = ({
  children,
  position = "top-left",
}: {
  children: ReactNode;
  position?: "top-left" | "bottom-right";
}) => (
  <span
    className={`pointer-events-none absolute bg-white px-1.5 py-0.5 text-xs ${
      position === "top-left" ? "left-2 top-2" : "bottom-2 right-2"
    }`}
  >
    {children}
  </span>
);

/**
 * The card's image area: links to its page and gets a black border on hover
 * or keyboard focus. `children` is the image (or a grid of them) at 11:15
 */
export const CardImage = ({
  to,
  label,
  badge,
  children,
}: {
  to: string;
  /** e.g. "View details for Linen shirt" */
  label: string;
  /** Labels over the image, e.g. a CardBadge */
  badge?: ReactNode;
  children: ReactNode;
}) => (
  <div className="relative border border-transparent p-0.5 transition-colors hover:border-black has-focus-visible:border-black">
    <Link
      to={to}
      aria-label={label}
      className="relative block aspect-11/15 overflow-hidden outline-none"
    >
      {children}
    </Link>
    {badge}
  </div>
);

/** The image itself, for cards that show a single one */
export const CardPhoto = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="block h-full w-full object-cover" />
);

/**
 * The text under the image: the title with anything on its right (a price,
 * the bookmark), then grey detail lines passed as children
 */
export const CardBody = ({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="px-2 pt-3 text-sm">
    <div className="flex items-start justify-between gap-2">
      <h2 className="min-w-0">{title}</h2>
      {aside && <div className="flex shrink-0 items-start gap-1">{aside}</div>}
    </div>
    {children}
  </div>
);

/** One grey detail line under a card's title */
export const CardDetail = ({ children }: { children: ReactNode }) => (
  <p className="mt-1 text-xs text-gray-600">{children}</p>
);

/** The save/favourite toggle on a card */
export const CardBookmark = ({
  isOn,
  disabled,
  label,
  onToggle,
}: {
  isOn: boolean;
  disabled: boolean;
  /** e.g. "Save Linen shirt" or "Remove Linen shirt from favourites" */
  label: string;
  onToggle: () => void;
}) => (
  <IconButton
    size="small"
    edge="end"
    disabled={disabled}
    aria-label={label}
    onClick={onToggle}
    sx={{ color: "inherit", marginTop: "-5px" }}
  >
    {isOn ? (
      <BookmarkIcon fontSize="small" />
    ) : (
      <BookmarkBorderIcon fontSize="small" />
    )}
  </IconButton>
);
