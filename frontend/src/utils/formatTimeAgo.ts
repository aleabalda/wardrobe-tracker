const UNITS = [
  { unit: "year", seconds: 365 * 24 * 60 * 60 },
  { unit: "month", seconds: 30 * 24 * 60 * 60 },
  { unit: "week", seconds: 7 * 24 * 60 * 60 },
  { unit: "day", seconds: 24 * 60 * 60 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
] as const;

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

// e.g. "7 weeks ago", "yesterday", "just now"
export const formatTimeAgo = (timestamp: string) => {
  const elapsed = (Date.now() - new Date(timestamp).getTime()) / 1000;

  for (const { unit, seconds } of UNITS) {
    if (elapsed >= seconds) {
      return formatter.format(-Math.floor(elapsed / seconds), unit);
    }
  }

  return "just now";
};
