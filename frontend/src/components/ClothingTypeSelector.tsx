import { CLOTHING_TYPES, type ClothingType } from "../types/clothingItemTypes";

const ALL_CLOTHING: ClothingType = "All Clothing";

export const ClothingTypeSelector = ({
  activeType,
  onSelect,
  count,
}: {
  activeType: ClothingType;
  onSelect: (type: ClothingType) => void;
  /** How many items are in the active type */
  count: number;
}) => {
  const isAll = activeType === ALL_CLOTHING;

  return (
    <div className="mb-8">
      <div className="mb-8 text-sm">
        <p className="text-xs">
          {isAll ? ALL_CLOTHING : `${ALL_CLOTHING} — ${activeType}`}
        </p>
        <p className="text-xs">
          {isAll ? "Clothing" : activeType} <sup>{count}</sup>
        </p>
      </div>
      <h2 className="text-5xl mb-8">{activeType}</h2>
      <div className="flex gap-2 overflow-x-auto w-full">
        {CLOTHING_TYPES.map(({ type, image }) => (
          <button
            key={type}
            aria-pressed={activeType === type}
            className={`shrink-0 cursor-pointer hover:underline ${
              activeType === type ? "underline" : ""
            }`}
            onClick={() => {
              onSelect(type);
            }}
          >
            <div
              className={`h-56 w-41 border p-0.5 hover:border-black ${
                activeType === type ? "border-black" : "border-transparent"
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-left text-xs mt-2">{type}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
