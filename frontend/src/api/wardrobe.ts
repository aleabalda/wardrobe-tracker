// api/wardrobe.ts

import type { ClothingItem } from "../types/ClothingItems";

const API_BASE_URL = "http://localhost:3000/api/clothing";

export const fetchClothingItems = async (): Promise<ClothingItem[]> => {
  const response = await fetch(`${API_BASE_URL}/get`, {
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

export const deleteClothingItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to delete clothing item: ${response.status} ${response.statusText}`,
    );
  }
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
