// api/wardrobe.ts

import type { ClothingItem } from "../types/ClothingItems";
import type { ArchiveReason } from "../utils/archiveReasons";

const API_BASE_URL = "http://localhost:3000/api/clothing";

/** Current wardrobe items by default; `archived` gets past items instead */
export const fetchClothingItems = async ({
  favouritesOnly = false,
  archived = false,
}: { favouritesOnly?: boolean; archived?: boolean } = {}): Promise<
  ClothingItem[]
> => {
  const params = new URLSearchParams();
  if (favouritesOnly) params.set("favourite", "true");
  if (archived) params.set("archived", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/get${query}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch clothing items: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<ClothingItem[]>;
};

export const fetchClothingItemById = async (
  id: string,
): Promise<ClothingItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch clothing item: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<ClothingItem>;
};

const readError = async (response: Response, fallback: string) => {
  const data: { message?: string } = await response.json().catch(() => ({}));
  return new Error(data.message ?? fallback);
};

/** Moves an item to past items; it stays in its outfits */
export const archiveClothingItem = async (
  id: number,
  reason: ArchiveReason,
): Promise<ClothingItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}/archive`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) throw await readError(response, "Unable to remove item.");

  return response.json() as Promise<ClothingItem>;
};

/** Brings a past item back into the wardrobe */
export const restoreClothingItem = async (
  id: number,
): Promise<ClothingItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}/restore`, {
    method: "PUT",
    credentials: "include",
  });

  if (!response.ok) throw await readError(response, "Unable to restore item.");

  return response.json() as Promise<ClothingItem>;
};

/** Permanent, and only allowed for past items; also removes it from outfits */
export const deleteClothingItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw await readError(response, "Unable to delete item.");
};

export const updateFavourite = async (
  id: number,
  isFavourite: boolean,
): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/favourite/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_favourite: isFavourite,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update favourite: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  return data.is_favourite;
};

export type ClothingItemUpdate = Pick<
  ClothingItem,
  "name" | "brand" | "type" | "color" | "size" | "description"
>;

export const updateClothingItem = async (
  id: number,
  update: ClothingItemUpdate,
): Promise<ClothingItem> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    const data: { message?: string } = await response.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to update clothing item.");
  }

  return response.json() as Promise<ClothingItem>;
};
