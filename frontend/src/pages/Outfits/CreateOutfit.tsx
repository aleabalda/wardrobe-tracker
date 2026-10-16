import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { fetchClothingItems } from "../../api/wardrobe";
import type { ClothingItem } from "../../types/ClothingItems";
import {
  CLOTHING_TYPES,
  type ClothingType,
} from "../../types/clothingItemTypes";

type OutfitCategory = Exclude<ClothingType, "All Clothing">;

const OUTFIT_CATEGORIES = CLOTHING_TYPES.map(({ type }) => type).filter(
  (val): val is OutfitCategory => val !== "All Clothing",
);

// categories where an outfit can have more than one item (e.g. layering)
const MULTI_SELECT_CATEGORIES: OutfitCategory[] = [
  "Tops",
  "Outerwear",
  "Accessories",
];

export const CreateOutfit = () => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const location = useLocation();
  // an item can be preselected when coming from its detail page
  const initialItemId = (location.state as { itemId?: number } | null)?.itemId;
  const [selectedIds, setSelectedIds] = useState<number[]>(
    initialItemId !== undefined ? [initialItemId] : [],
  );
  const [activeStep, setActiveStep] = useState<number>(0);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await fetchClothingItems();
        setClothingItems(items);
      } catch (error) {
        console.error("Unable to load clothing items:", error);
        setError("Unable to load your wardrobe.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchItems();
  }, []);

  const activeCategory = OUTFIT_CATEGORIES[activeStep];
  const isMultiSelect = MULTI_SELECT_CATEGORIES.includes(activeCategory);
  // only the current step's items are rendered
  const activeItems = clothingItems.filter(
    (item) => item.type === activeCategory,
  );

  const toggleItem = (item: ClothingItem) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== item.id));
      return;
    }

    if (MULTI_SELECT_CATEGORIES.includes(item.type as OutfitCategory)) {
      setSelectedIds([...selectedIds, item.id]);
      return;
    }

    // single-select categories: replace any item already chosen of this type
    const sameTypeIds = clothingItems
      .filter((other) => other.type === item.type)
      .map((other) => other.id);
    setSelectedIds([
      ...selectedIds.filter((id) => !sameTypeIds.includes(id)),
      item.id,
    ]);
  };

  const selectedItems = clothingItems.filter((item) =>
    selectedIds.includes(item.id),
  );

  if (isLoading) {
    return <p className="p-12 pt-6">Loading wardrobe...</p>;
  }

  if (error) {
    return <p className="p-12 pt-6 text-red-600">{error}</p>;
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto p-12 pt-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-4xl">Create Outfit</h2>
          <button
            type="button"
            onClick={() => {
              navigate("/outfits");
            }}
            className="cursor-pointer text-xs underline"
          >
            Cancel
          </button>
        </div>
        <ol className="mb-8 flex gap-4 overflow-x-auto">
          {OUTFIT_CATEGORIES.map((category, index) => {
            const selectedCount = selectedItems.filter(
              (item) => item.type === category,
            ).length;

            return (
              <li key={category} className="shrink-0">
                <button
                  type="button"
                  aria-current={index === activeStep ? "step" : undefined}
                  onClick={() => {
                    setActiveStep(index);
                  }}
                  className={`cursor-pointer text-xs hover:underline ${
                    index === activeStep ? "underline" : "text-gray-500"
                  }`}
                >
                  {index + 1}. {category}
                  {selectedCount > 0 && ` (${selectedCount})`}
                </button>
              </li>
            );
          })}
        </ol>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <h3 className="">{activeCategory}</h3>
              <p className="text-xs text-gray-500">
                {isMultiSelect ? "Choose any" : "Choose one"}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Step {activeStep + 1} of {OUTFIT_CATEGORIES.length}
            </p>
          </div>
          <div className="w-full h-px rounded bg-black mb-4"></div>
          {activeItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              No clothing items of this type.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      toggleItem(item);
                    }}
                    className="group cursor-pointer text-left"
                  >
                    <div
                      className={`relative mb-1 overflow-hidden ${
                        isSelected
                          ? "outline-1 outline-black"
                          : "group-hover:outline-1 group-hover:outline-black"
                      }`}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="block w-full aspect-9/16 object-cover"
                      />
                    </div>
                    <p className="text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.brand} | Size {item.size}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-8 flex gap-3">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveStep(activeStep - 1);
                }}
                className="cursor-pointer underline text-sm"
              >
                Previous
              </button>
            )}
            {activeStep < OUTFIT_CATEGORIES.length - 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveStep(activeStep + 1);
                }}
                className="cursor-pointer underline text-sm"
              >
                Next
              </button>
            )}
          </div>
        </section>
      </div>

      <aside className="h-full w-96 shrink-0 overflow-y-auto border-l border-black p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="">Your Outfit</h2>
          {selectedItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedIds([]);
              }}
              className="cursor-pointer text-xs hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        {selectedItems.length === 0 ? (
          <p className="text-xs text-gray-500">
            Select items from your wardrobe to build an outfit.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {OUTFIT_CATEGORIES.map((category) => {
              const items = selectedItems.filter(
                (item) => item.type === category,
              );
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <p className="mb-2 text-xs text-gray-500">{category}</p>
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-16 w-12 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-gray-600">
                            {item.brand}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => {
                            toggleItem(item);
                          }}
                          className="cursor-pointer text-gray-500 hover:text-black"
                        >
                          <CloseIcon fontSize="small" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
};
