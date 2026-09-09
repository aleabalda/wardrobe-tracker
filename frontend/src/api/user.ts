const API_BASE_URL = "http://localhost:3000/api/user";
import type { UserDetails } from "../types/UserDetails";

export const fetchUserDetails = async (): Promise<UserDetails> => {
  const res = await fetch(`${API_BASE_URL}/fetch`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user details");
  }

  const data: UserDetails = await res.json();

  return data;
};
