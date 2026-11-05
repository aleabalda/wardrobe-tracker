export const FILTER_FIELDS = [
  { key: "color", label: "Color" },
  { key: "size", label: "Size" },
  { key: "brand", label: "Brand" },
] as const;

export type FilterField = (typeof FILTER_FIELDS)[number];
export type FilterKey = FilterField["key"];
export type ItemFilters = Record<FilterKey, string[]>;
export type FilterableItem = Record<FilterKey, string | null>;

export const EMPTY_FILTERS: ItemFilters = { color: [], size: [], brand: [] };

const SIZE_ORDER = ["xxs", "xs", "s", "m", "l", "xl", "xxl", "xxxl"];

// colour, size and brand are free text, so "Navy" and "navy " count as the same
const normalize = (value: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const compareOptions = (key: FilterKey, a: string, b: string) => {
  if (key === "size") {
    const rankA = SIZE_ORDER.indexOf(normalize(a));
    const rankB = SIZE_ORDER.indexOf(normalize(b));

    if (rankA !== -1 && rankB !== -1) return rankA - rankB;
    if (rankA !== -1) return -1;
    if (rankB !== -1) return 1;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

/**
 * The values to offer for a filter. Selected values are always included so they
 * can still be unticked after switching to a type that doesn't have them.
 */
export const getFilterOptions = (
  items: FilterableItem[],
  key: FilterKey,
  selected: string[],
) => {
  const options = new Map<string, string>();

  for (const value of [...selected, ...items.map((item) => item[key])]) {
    const normalized = normalize(value);
    if (normalized && !options.has(normalized)) {
      options.set(normalized, String(value).trim());
    }
  }

  return [...options.values()].sort((a, b) => compareOptions(key, a, b));
};

/** Items must match every filter in use, and any selected value within one. */
export const matchesFilters = (item: FilterableItem, filters: ItemFilters) =>
  FILTER_FIELDS.every(
    ({ key }) =>
      filters[key].length === 0 ||
      filters[key].some((value) => normalize(value) === normalize(item[key])),
  );

export const toggleFilterValue = (
  filters: ItemFilters,
  key: FilterKey,
  value: string,
): ItemFilters => ({
  ...filters,
  [key]: filters[key].includes(value)
    ? filters[key].filter((val) => val !== value)
    : [...filters[key], value],
});

export const countActiveFilters = (filters: ItemFilters) =>
  FILTER_FIELDS.reduce((total, { key }) => total + filters[key].length, 0);
