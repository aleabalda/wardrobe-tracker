// e.g. "Oct 23, 3:45 PM"
export const formatMessageTime = (timestamp: string) =>
  new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// e.g. "October 23, 2026"
export const formatMessageDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
