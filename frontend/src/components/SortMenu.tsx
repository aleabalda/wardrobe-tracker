import { useState } from "react";

export function SortMenu<SortValue extends string>({
  options,
  value,
  onChange,
  panelClassName,
}: {
  options: readonly { value: SortValue; label: string }[];
  value: SortValue;
  onChange: (value: SortValue) => void;
  /** Which side the panel opens from and any border, e.g. "right-0 border" */
  panelClassName: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeLabel = options.find((option) => option.value === value)?.label;

  return (
    <div
      className="relative text-xs"
      onKeyDown={(e) => {
        if (e.key === "Escape") setIsOpen(false);
      }}
    >
      {isOpen && (
        // invisible backdrop so clicking anywhere else closes the menu
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsOpen(false);
          }}
        ></div>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer"
      >
        Sort by: <span className="underline">{activeLabel}</span>{" "}
        {isOpen ? "▴" : "▾"}
      </button>
      {isOpen && (
        <ul
          aria-label="Sort options"
          className={`absolute top-full z-20 mt-2 w-48 bg-white py-1 shadow-lg ${panelClassName}`}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full cursor-pointer px-3 py-1.5 text-left hover:underline ${
                  value === option.value ? "underline" : ""
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
