import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

/** A compact search box for toolbars, with a button to clear it */
export const SearchField = ({
  value,
  onChange,
  label,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  /** Read by screen readers and shown as the placeholder, e.g. "Search items" */
  label: string;
  className?: string;
}) => (
  <div
    className={`flex h-7 items-center gap-1 border border-black bg-white px-2 focus-within:ring-1 focus-within:ring-black ${className}`}
  >
    <SearchIcon aria-hidden="true" sx={{ fontSize: 16 }} />
    <input
      type="search"
      aria-label={label}
      placeholder={label}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && value) {
          e.stopPropagation();
          onChange("");
        }
      }}
      className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:appearance-none"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => {
          onChange("");
        }}
        className="flex cursor-pointer items-center"
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </button>
    )}
  </div>
);
