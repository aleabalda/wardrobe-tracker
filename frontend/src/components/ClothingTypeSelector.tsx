import { CLOTHING_TYPES, type ClothingType } from "../types/clothingItemTypes";
import { CategorySelector } from "./CategorySelector";

const OPTIONS = CLOTHING_TYPES.map(({ type, image }) => ({
  value: type,
  image,
}));

export const ClothingTypeSelector = ({
  activeType,
  onSelect,
  count,
}: {
  activeType: ClothingType;
  onSelect: (type: ClothingType) => void;
  /** How many items are in the active type */
  count: number;
}) => (
  <CategorySelector
    options={OPTIONS}
    activeValue={activeType}
    onSelect={onSelect}
    count={count}
    allNoun="Clothing"
  />
);
