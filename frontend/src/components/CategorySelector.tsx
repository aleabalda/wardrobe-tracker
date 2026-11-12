import { useEffect, useRef, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// shown while hovering the row, centred on the h-56 images (top-28 = half);
// touch screens can swipe instead, so they don't get them
const arrowClass =
  "absolute top-28 z-1 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center border border-black bg-white opacity-0 shadow-md transition-opacity duration-200 hover:bg-black hover:text-white focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:hidden";

/**
 * The breadcrumb, count, heading and row of image cards at the top of a
 * browse page. The first option is the "show everything" one.
 */
export function CategorySelector<Value extends string>({
  options,
  activeValue,
  onSelect,
  count,
  allNoun,
}: {
  options: readonly { value: Value; image: string }[];
  activeValue: Value;
  onSelect: (value: Value) => void;
  /** How many results are in the active category */
  count: number;
  /** What everything is called next to the count, e.g. "Clothing" */
  allNoun: string;
}) {
  const allValue = options[0].value;
  const isAll = activeValue === allValue;
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  // kept in sync as the row scrolls or the window resizes
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const update = () => {
      // 1px of slack for fractional scroll positions on zoomed/HiDPI screens
      setCanScrollLeft(row.scrollLeft > 1);
      setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    };

    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);

    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [options.length]);

  const scrollToEnd = (toStart: boolean) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollTo({ left: toStart ? 0 : row.scrollWidth, behavior: "smooth" });
  };

  return (
    <div className="mb-8">
      <div className="mb-8 text-sm">
        <p className="text-xs">
          {isAll ? allValue : `${allValue} — ${activeValue}`}
        </p>
        <p className="text-xs">
          {isAll ? allNoun : activeValue} <sup>{count}</sup>
        </p>
      </div>
      <h2 className="text-5xl mb-8">{activeValue}</h2>
      <div className="group relative">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll to the start"
            onClick={() => {
              scrollToEnd(true);
            }}
            className={`${arrowClass} left-2`}
          >
            <ChevronLeftIcon />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll to the end"
            onClick={() => {
              scrollToEnd(false);
            }}
            className={`${arrowClass} right-2`}
          >
            <ChevronRightIcon />
          </button>
        )}
        <div ref={rowRef} className="flex gap-2 overflow-x-auto w-full">
          {options.map(({ value, image }) => (
            <button
              key={value}
              aria-pressed={activeValue === value}
              className={`shrink-0 cursor-pointer hover:underline ${
                activeValue === value ? "underline" : ""
              }`}
              onClick={() => {
                onSelect(value);
              }}
            >
              <div
                className={`h-56 w-41 border p-0.5 hover:border-black ${
                  activeValue === value ? "border-black" : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-left text-xs mt-2">{value}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
