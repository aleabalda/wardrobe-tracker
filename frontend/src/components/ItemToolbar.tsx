import { useRef, useState, type ReactNode } from "react";
import { FilterDrawer } from "./FilterDrawer";
import {
  EMPTY_FILTERS,
  FILTER_FIELDS,
  countActiveFilters,
  getFilterOptions,
  toggleFilterValue,
  type FilterField,
  type FilterKey,
  type FilterableItem,
  type ItemFilters,
} from "../utils/itemFilters";

type OpenMenu = FilterKey | "sort" | null;

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
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const allFiltersButtonRef = useRef<HTMLButtonElement>(null);

  const activeFilterCount = countActiveFilters(filters);
  const activeSortLabel = sortOptions.find(
    ({ value }) => value === sortValue,
  )?.label;

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    allFiltersButtonRef.current?.focus();
  };

  const renderOptions = (key: FilterKey) => {
    const options = getFilterOptions(items, key, filters[key]);

    if (options.length === 0) {
      return <p className="text-sm text-gray-500">No options available.</p>;
    }

    return (
      <ul className="flex flex-col gap-2">
        {options.map((option) => (
          <li key={option}>
            <label className="flex cursor-pointer items-center gap-2 text-sm hover:underline">
              <input
                type="checkbox"
                checked={filters[key].includes(option)}
                onChange={() => {
                  onFiltersChange(toggleFilterValue(filters, key, option));
                }}
                className="cursor-pointer accent-black"
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="relative mb-2 flex flex-wrap items-center justify-between gap-3"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        setOpenMenu(null);
        if (isDrawerOpen) closeDrawer();
      }}
    >
      {openMenu && (
        // invisible backdrop so clicking anywhere else closes the menu
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setOpenMenu(null);
          }}
        ></div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {action}
        {fields.map(({ key, label }) => (
          // on small screens panels anchor to the toolbar so they stay on screen
          <div key={key} className="sm:relative">
            <button
              type="button"
              aria-expanded={openMenu === key}
              onClick={() => {
                toggleMenu(key);
              }}
              className={filterButtonClass(
                openMenu === key || filters[key].length > 0,
              )}
            >
              {label}
              {filters[key].length > 0 && ` (${filters[key].length})`}
            </button>
            {openMenu === key && (
              <div
                className={`${panelClass} left-0 max-h-72 w-56 overflow-y-auto p-3`}
              >
                {renderOptions(key)}
              </div>
            )}
          </div>
        ))}
        <button
          ref={allFiltersButtonRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isDrawerOpen}
          onClick={() => {
            setIsDrawerOpen(true);
          }}
          className={filterButtonClass(isDrawerOpen)}
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
          aria-expanded={openMenu === "sort"}
          onClick={() => {
            toggleMenu("sort");
          }}
          className="cursor-pointer"
        >
          Sort by: <span className="underline">{activeSortLabel}</span>{" "}
          {openMenu === "sort" ? "▴" : "▾"}
        </button>
        {openMenu === "sort" && (
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
                    setOpenMenu(null);
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
