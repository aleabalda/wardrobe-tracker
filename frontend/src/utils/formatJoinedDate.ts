/**
 * "November 2026" for when an account was made, or null if the date is
 * missing or invalid so callers can leave the line out instead of showing NaN
 */
export const formatJoinedDate = (date: string | null | undefined) => {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
};
