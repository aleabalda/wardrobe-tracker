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

export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_BASE_URL}/avatar`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload profile picture");
  }

  const data: { avatar_url: string } = await res.json();

  return data.avatar_url;
};
