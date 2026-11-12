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
      <div className="flex gap-2 overflow-x-auto w-full">
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
              <img src={image} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-left text-xs mt-2">{value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
