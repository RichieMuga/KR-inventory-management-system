export function extractAssetIdFromUrl(url: string): number {
  const path = new URL(url).pathname; // e.g. /api/bulk-assets/123
  const parts = path.split("/").filter(Boolean);
  const idStr = parts[parts.length - 1]; // Last segment
  return parseInt(idStr, 10);
}
