import { format } from "date-fns";

/**
 * Format a date string into something human readable.
 * Example:
 *   "2025-09-11T15:10:27.013Z" → "Sep 11, 2025 18:10"
 *   null → "-"
 *   undefined → "-"
 *   invalid date → "-"
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-"; // covers null, undefined, empty string

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-"; // covers invalid date
    return format(date, "MMM dd, yyyy HH:mm");
  } catch {
    return "-"; // fallback for anything unexpected
  }
};
