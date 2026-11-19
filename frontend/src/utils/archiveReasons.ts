// why an item left the wardrobe; "discarded" is shown to users as "Thrown out"
export const ARCHIVE_REASONS = [
  { value: "sold", label: "Sold" },
  { value: "donated", label: "Donated" },
  { value: "discarded", label: "Thrown out" },
  { value: "other", label: "Other" },
] as const;

export type ArchiveReason = (typeof ARCHIVE_REASONS)[number]["value"];

/** The label shown on a past item, e.g. "Donated"; "No longer owned" for other */
export const getArchiveLabel = (reason: ArchiveReason | null | undefined) =>
  reason === "other" || !reason
    ? "No longer owned"
    : ARCHIVE_REASONS.find(({ value }) => value === reason)?.label;
