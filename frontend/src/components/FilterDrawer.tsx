import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  getFilterOptions,
  toggleFilterValue,
  type FilterField,
  type FilterKey,
  type FilterableItem,
  type ItemFilters,
} from "../utils/itemFilters";

const DrawerContent = ({
  onClose,
  items,
  fields,
  filters,
  onFiltersChange,
  resultCount,
  resultNoun,
}: {
  onClose: () => void;
  items: FilterableItem[];
  fields: readonly FilterField[];
  filters: ItemFilters;
  onFiltersChange: (filters: ItemFilters) => void;
  resultCount: number;
  resultNoun: string;
}) => {
  const [collapsed, setCollapsed] = useState<FilterKey[]>([]);

  const activeFilterCount = countActiveFilters(filters);

  const toggleSection = (key: FilterKey) => {
    setCollapsed(
      collapsed.includes(key)
        ? collapsed.filter((val) => val !== key)
        : [...collapsed, key],
    );
  };

  return (
    <>
      <div className="border-b border-black px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm">
            {activeFilterCount === 0
              ? "No Filters Selected"
              : `${activeFilterCount} ${
                  activeFilterCount === 1 ? "Filter" : "Filters"
                } Applied`}
          </p>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="cursor-pointer text-sm underline"
          >
            Done
          </button>
        </div>
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {fields.flatMap(({ key }) =>
              filters[key].map((value) => (
                <button
                  key={`${key}-${value}`}
                  type="button"
                  aria-label={`Remove ${value} filter`}
                  onClick={() => {
                    onFiltersChange(toggleFilterValue(filters, key, value));
                  }}
                  className="flex cursor-pointer items-center gap-2 bg-black px-2 py-1 text-sm text-white"
                >
                  {value}
                  <CloseIcon sx={{ fontSize: 16 }} />
                </button>
              )),
            )}
            <button
              type="button"
              onClick={() => {
                onFiltersChange(EMPTY_FILTERS);
              }}
              className="ml-1 cursor-pointer text-sm underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {fields.map(({ key, label }) => {
          const isExpanded = !collapsed.includes(key);
          const options = getFilterOptions(items, key, filters[key]);

          return (
            <section key={key} className="border-b border-black px-6 py-5">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => {
                  toggleSection(key);
                }}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <h3 className="text-lg">{label}</h3>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-sm">
                    {filters[key].join(", ")}
                  </span>
                  {isExpanded ? (
                    <KeyboardArrowDownIcon />
                  ) : (
                    <KeyboardArrowRightIcon />
                  )}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-4">
                  {options.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No options available.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {options.map((option) => (
                        <li key={option}>
                          <label className="flex cursor-pointer items-center gap-3 text-sm">
                            <span className="relative flex size-4 shrink-0">
                              <input
                                type="checkbox"
                                checked={filters[key].includes(option)}
                                onChange={() => {
                                  onFiltersChange(
                                    toggleFilterValue(filters, key, option),
                                  );
                                }}
                                className="peer size-4 cursor-pointer appearance-none border border-black checked:bg-black"
                              />
                              <CheckIcon
                                sx={{ fontSize: 14 }}
                                className="pointer-events-none absolute inset-px hidden text-white peer-checked:block"
                              />
                            </span>
                            {option}
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer border border-black bg-black py-3 text-sm text-white transition-colors hover:bg-white hover:text-black"
        >
          View {resultCount} {resultNoun}
          {resultCount === 1 ? "" : "s"}
        </button>
      </div>
    </>
  );
};

/** Panel that slides in from the right with every filter in one place. */
export const FilterDrawer = ({
  isOpen,
  onClose,
  items,
  fields,
  filters,
  onFiltersChange,
  resultCount,
  resultNoun,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: FilterableItem[];
  fields: readonly FilterField[];
  filters: ItemFilters;
  onFiltersChange: (filters: ItemFilters) => void;
  /** How many results match the current filters */
  resultCount: number;
  /** What the results are called on the view button, e.g. "Item" */
  resultNoun: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="All filters"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-40 flex w-122 max-w-full flex-col bg-white shadow-xl outline-none"
          >
            <DrawerContent
              onClose={onClose}
              items={items}
              fields={fields}
              filters={filters}
              onFiltersChange={onFiltersChange}
              resultCount={resultCount}
              resultNoun={resultNoun}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
