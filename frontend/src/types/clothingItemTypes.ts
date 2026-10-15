export const CLOTHING_TYPES = [
  "All Clothing",
  "Tops",
  "Bottoms",
  "Dresses & Jumpsuits",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Underwear & Socks",
] as const;

export type ClothingType = (typeof CLOTHING_TYPES)[number];
