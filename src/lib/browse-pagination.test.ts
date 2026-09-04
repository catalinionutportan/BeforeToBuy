import { describe, expect, it } from "vitest";
import {
  BROWSE_PAGE_SIZE,
  buildBrowsePaginationItems,
  normalizeBrowsePage,
} from "@/lib/browse-pagination";

describe("browse pagination", () => {
  it("uses complete rows for each supported responsive column count", () => {
    expect(BROWSE_PAGE_SIZE % 4).toBe(0);
    expect(BROWSE_PAGE_SIZE % 3).toBe(0);
    expect(BROWSE_PAGE_SIZE % 2).toBe(0);
  });

  it("normalizes invalid page values", () => {
    expect(normalizeBrowsePage(undefined)).toBe(1);
    expect(normalizeBrowsePage("not-a-page")).toBe(1);
    expect(normalizeBrowsePage("-4")).toBe(1);
    expect(normalizeBrowsePage("3.8")).toBe(3);
  });

  it("keeps pagination compact while retaining the current page", () => {
    expect(buildBrowsePaginationItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(buildBrowsePaginationItems(8, 20)).toEqual([
      1,
      "ellipsis-left",
      7,
      8,
      9,
      "ellipsis-right",
      20,
    ]);
    expect(buildBrowsePaginationItems(20, 20)).toEqual([
      1,
      "ellipsis-left",
      17,
      18,
      19,
      20,
    ]);
  });
});
