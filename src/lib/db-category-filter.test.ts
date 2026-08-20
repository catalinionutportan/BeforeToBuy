import { describe, expect, it } from "vitest";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";

describe("expandCategoryFilterToDbIds", () => {
  it("returns null for all / empty", () => {
    expect(expandCategoryFilterToDbIds(undefined)).toBeNull();
    expect(expandCategoryFilterToDbIds("all")).toBeNull();
  });

  it("expands electronics hub to leaf ids including networking and notebooks", () => {
    const ids = expandCategoryFilterToDbIds("hub-electronics");
    expect(ids).toContain("networking-cables");
    expect(ids).toContain("notebooks-monitors");
    expect(ids).toContain("peripherals-storage");
    expect(ids).not.toContain("hub-electronics");
  });

  it("expands DIY hub to hand-tool leaves", () => {
    const ids = expandCategoryFilterToDbIds("hub-diy");
    expect(ids).toContain("diy-hand-tools");
    expect(ids).toContain("diy-power-tools");
    expect(ids).not.toContain("auto-tires-wheels");
  });

  it("expands Auto hub to tyre leaves", () => {
    const ids = expandCategoryFilterToDbIds("hub-auto");
    expect(ids).toContain("auto-tires-wheels");
    expect(ids).toContain("auto-complete-wheels");
    expect(ids).toContain("auto-batteries");
    expect(ids).not.toContain("diy-power-tools");
  });
});
