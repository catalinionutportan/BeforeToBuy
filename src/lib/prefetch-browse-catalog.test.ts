import { describe, expect, it } from "vitest";
import { PREFETCH_BROWSE_MARKETS } from "./prefetch-browse-catalog";

describe("prefetch browse markets", () => {
  it("includes CH so a GB session can warm Switzerland before switch", () => {
    expect(PREFETCH_BROWSE_MARKETS).toContain("CH");
    expect(PREFETCH_BROWSE_MARKETS).toContain("GB");
  });
});
