import type { ListingItem } from "../types/ListingItem";

const API_BASE_URL = "http://localhost:3000/api/listing";

export const createListing = async (
  clothingItemId: number,
  price: number,
  status: "active" | "sold" | "cancelled" = "active",
) => {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clothingItemId,
      price,
      status,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create listing");
  }

  return res.json();
};

export const fetchAllListings = async (): Promise<ListingItem[]> => {
  const res = await fetch(`${API_BASE_URL}/get`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch listings: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<ListingItem[]>;
};
