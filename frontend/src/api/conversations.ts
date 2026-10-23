import type {
  Conversation,
  ConversationDetail,
  Message,
} from "../types/Conversation";

const API_BASE_URL = "http://localhost:3000/api/conversation";

// returns the existing conversation if the user already messaged this listing
export const startConversation = async (
  listingId: number,
): Promise<{ id: number }> => {
  const res = await fetch(`${API_BASE_URL}/start`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    throw new Error("Failed to start conversation");
  }

  return res.json();
};

export const fetchConversations = async (): Promise<Conversation[]> => {
  const res = await fetch(`${API_BASE_URL}/get`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch conversations");
  }

  return res.json();
};

export const fetchConversation = async (
  id: number,
): Promise<ConversationDetail> => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch conversation");
  }

  return res.json();
};

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await fetch(`${API_BASE_URL}/unread-count`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch unread count");
  }

  const data = await res.json();

  return data.count;
};

export const markConversationRead = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/${id}/read`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to mark conversation as read");
  }
};

export const sendMessage = async (
  conversationId: number,
  body: string,
): Promise<Message> => {
  const res = await fetch(`${API_BASE_URL}/${conversationId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
};
