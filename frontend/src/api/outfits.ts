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
