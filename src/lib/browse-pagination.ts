export const BROWSE_PAGE_SIZE = 48;

export type BrowsePaginationItem = number | "ellipsis-left" | "ellipsis-right";

export function normalizeBrowsePage(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function buildBrowsePaginationItems(
  currentPage: number,
  totalPages: number
): BrowsePaginationItem[] {
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.min(normalizeBrowsePage(currentPage), total);
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const ordered = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items: BrowsePaginationItem[] = [];

  ordered.forEach((page, index) => {
    const previous = ordered[index - 1];
    if (previous !== undefined && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-left" : "ellipsis-right");
    }
    items.push(page);
  });

  return items;
}
