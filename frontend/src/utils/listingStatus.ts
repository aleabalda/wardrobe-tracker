// "cancelled" is stored in the database but shown to users as "Inactive"
export const LISTING_STATUSES = [
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Inactive" },
  { value: "sold", label: "Sold" },
  { value: "pending", label: "Pending" },
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number]["value"];

// active is the normal state, so only the others get a label on previews
export const getListingStatusBadge = (status: ListingStatus) =>
  status === "active"
    ? undefined
    : LISTING_STATUSES.find(({ value }) => value === status)?.label;
