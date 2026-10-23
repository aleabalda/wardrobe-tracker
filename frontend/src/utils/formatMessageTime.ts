// e.g. "Oct 23, 3:45 PM"
export const formatMessageTime = (timestamp: string) =>
  new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
