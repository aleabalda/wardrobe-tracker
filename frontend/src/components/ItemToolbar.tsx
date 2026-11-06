import { useRef, useState, type ReactNode } from "react";
import { FilterDrawer } from "./FilterDrawer";
import {
  EMPTY_FILTERS,
  FILTER_FIELDS,
  countActiveFilters,
  type FilterField,
  type FilterKey,
  type FilterableItem,
  type ItemFilters,
} from "../utils/itemFilters";

const filterButtonClass = (isHighlighted: boolean) =>
  `cursor-pointer border border-black px-3 py-1.5 text-sm transition-colors hover:bg-black hover:text-white ${
    isHighlighted ? "bg-black text-white" : ""
  }`;

const panelClass =
  "absolute top-full z-20 mt-2 border border-black bg-white shadow-lg";

export function ItemToolbar<SortValue extends string>({
  items,
  fields = FILTER_FIELDS,
  filters,
  onFiltersChange,
  resultCount,
  resultNoun = "Item",
  sortOptions,
  sortValue,
  onSortChange,
  action,
}: {
  /** The items the filter options are built from */
  items: FilterableItem[];
  /** Which filters to offer; defaults to all of them */
  fields?: readonly FilterField[];
  filters: ItemFilters;
  onFiltersChange: (filters: ItemFilters) => void;
  /** How many results match the current filters */
  resultCount: number;
  /** What the results are called in the filter panel */
  resultNoun?: string;
  sortOptions: readonly { value: SortValue; label: string }[];
  sortValue: SortValue;
  onSortChange: (value: SortValue) => void;
  /** Page action shown before the filters, e.g. an add button */
  action?: ReactNode;
}) {
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  // the only section expanded when the drawer opens; null expands all of them
  const [drawerSection, setDrawerSection] = useState<FilterKey | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);

  const activeFilterCount = countActiveFilters(filters);
  const activeSortLabel = sortOptions.find(
    ({ value }) => value === sortValue,
  )?.label;

  const openDrawer = (section: FilterKey | null, trigger: HTMLButtonElement) => {
    drawerTriggerRef.current = trigger;
    setDrawerSection(section);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerTriggerRef.current?.focus();
  };

  return (
    <div
      className="relative mb-2 flex flex-wrap items-center justify-between gap-3"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        setIsSortOpen(false);
        if (isDrawerOpen) closeDrawer();
      }}
    >
      {isSortOpen && (
        // invisible backdrop so clicking anywhere else closes the menu
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsSortOpen(false);
          }}
        ></div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {action}
        {fields.map(({ key, label }) => {
          const isOpen = isDrawerOpen && drawerSection === key;

          return (
            <button
              key={key}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              onClick={(e) => {
                openDrawer(key, e.currentTarget);
              }}
              className={filterButtonClass(isOpen || filters[key].length > 0)}
            >
              {label}
              {filters[key].length > 0 && ` (${filters[key].length})`}
            </button>
          );
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isDrawerOpen && drawerSection === null}
          onClick={(e) => {
            openDrawer(null, e.currentTarget);
          }}
          className={filterButtonClass(isDrawerOpen && drawerSection === null)}
        >
          All Filters
        </button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onFiltersChange(EMPTY_FILTERS);
            }}
            className="cursor-pointer text-sm underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="relative text-sm">
        <button
          type="button"
          aria-expanded={isSortOpen}
          onClick={() => {
            setIsSortOpen(!isSortOpen);
          }}
          className="cursor-pointer"
        >
          Sort by: <span className="underline">{activeSortLabel}</span>{" "}
          {isSortOpen ? "▴" : "▾"}
        </button>
        {isSortOpen && (
          <ul
            aria-label="Sort items"
            className={`${panelClass} right-0 w-48 py-1`}
          >
            {sortOptions.map(({ value, label }) => (
              <li key={value}>
                <button
                  type="button"
                  aria-pressed={sortValue === value}
                  onClick={() => {
                    onSortChange(value);
                    setIsSortOpen(false);
                  }}
                  className={`w-full cursor-pointer px-3 py-1.5 text-left hover:underline ${
                    sortValue === value ? "underline" : ""
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FilterDrawer
        isOpen={isDrawerOpen}
        initialSection={drawerSection}
        onClose={closeDrawer}
        items={items}
        fields={fields}
        filters={filters}
        onFiltersChange={onFiltersChange}
        resultCount={resultCount}
        resultNoun={resultNoun}
      />
    </div>
  );
}
