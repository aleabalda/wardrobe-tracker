import type { ListingDetail, ListingItem } from "../types/ListingItem";
import type { ListingStatus } from "../utils/listingStatus";

const API_BASE_URL = "http://localhost:3000/api/listing";

export const createListing = async (
  clothingItemId: number,
  price: number,
  description?: string,
  status: ListingStatus = "active",
): Promise<{ id: number }> => {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clothingItemId,
      price,
      description,
      status,
    }),
  });

  if (!res.ok) {
    const data: { message?: string } = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to create listing.");
  }

  return res.json();
};

export const fetchAllListings = async (
  savedOnly = false,
): Promise<ListingItem[]> => {
  const query = savedOnly ? "?saved=true" : "";
  const res = await fetch(`${API_BASE_URL}/get${query}`, {
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

export const updateListingSaved = async (
  id: number,
  isSaved: boolean,
): Promise<boolean> => {
  const res = await fetch(`${API_BASE_URL}/saved/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_saved: isSaved }),
  });

  if (!res.ok) {
    throw new Error("Failed to update saved listing");
  }

  const data = await res.json();

  return data.is_saved;
};

export const fetchListingById = async (id: string): Promise<ListingDetail> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch listing: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ListingDetail>;
};

export type ListingUpdate = {
  name: string;
  brand: string;
  type: string;
  size: string;
  color: string;
  price: number;
  status: ListingStatus;
  description: string;
};

/** Seller only; the item fields change the clothing item in the wardrobe too */
export const updateListing = async (
  id: number,
  update: ListingUpdate,
): Promise<ListingDetail> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    const data: { message?: string } = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to update listing.");
  }

  return res.json() as Promise<ListingDetail>;
};
