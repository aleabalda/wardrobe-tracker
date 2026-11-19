import { useRef, useState, type ReactNode } from "react";
import { FilterDrawer } from "./FilterDrawer";
import { SortMenu } from "./SortMenu";
import { SearchField } from "./SearchField";
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
  `cursor-pointer border border-black px-2 py-1 text-xs transition-colors hover:bg-black hover:text-white ${
    isHighlighted ? "bg-black text-white" : ""
  }`;

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
  search,
  onSearchChange,
  searchLabel = "Search",
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
  /** The search box text; the box is only shown when onSearchChange is given */
  search?: string;
  onSearchChange?: (search: string) => void;
  /** e.g. "Search listings" */
  searchLabel?: string;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  // the only section expanded when the drawer opens; null expands all of them
  const [drawerSection, setDrawerSection] = useState<FilterKey | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);

  const activeFilterCount = countActiveFilters(filters);

  const openDrawer = (
    section: FilterKey | null,
    trigger: HTMLButtonElement,
  ) => {
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
        if (e.key === "Escape" && isDrawerOpen) closeDrawer();
      }}
    >
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

      <div className="flex items-center gap-3">
        {onSearchChange && (
          <SearchField
            value={search ?? ""}
            onChange={onSearchChange}
            label={searchLabel}
            className="w-48 sm:w-60"
          />
        )}
        <SortMenu
          options={sortOptions}
          value={sortValue}
          onChange={onSortChange}
          panelClassName="right-0"
        />
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
