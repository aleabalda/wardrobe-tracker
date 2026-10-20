import type { Outfit } from "../types/Outfit";

const API_BASE_URL = "http://localhost:3000/api/outfit";

export const createOutfit = async (
  clothingItemIds: number[],
  name?: string,
  description?: string,
): Promise<{ id: number; message: string }> => {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clothingItemIds,
      name,
      description,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create outfit");
  }

  return res.json();
};

export const fetchOutfits = async (): Promise<Outfit[]> => {
  const res = await fetch(`${API_BASE_URL}/get`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch outfits");
  }

  return res.json();
};

export const deleteOutfit = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete outfit");
  }
};
