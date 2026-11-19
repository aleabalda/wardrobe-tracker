import type { ReactNode } from "react";
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
  headingAction,
}: {
  activeType: ClothingType;
  onSelect: (type: ClothingType) => void;
  /** How many items are in the active type */
  /** null while loading */
  count: number | null;
  /** Shown on the heading's line, at the right */
  headingAction?: ReactNode;
}) => (
  <CategorySelector
    options={OPTIONS}
    activeValue={activeType}
    onSelect={onSelect}
    count={count}
    allNoun="Clothing"
    headingAction={headingAction}
  />
);
