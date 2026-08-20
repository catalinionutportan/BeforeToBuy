import { describe, expect, it } from "vitest";
import {
  AUTO_COMPLETE_WHEELS_LEAF,
  AUTO_TIRES_LEAF,
  resolveAutoLeafFromTitle,
  titleLooksLikeCompleteWheelOrRim,
} from "@/lib/reifen-wheel-split";

describe("reifen wheel split", () => {
  it("treats Reifen rim offset codes as complete-wheel tiles", () => {
    expect(titleLooksLikeCompleteWheelOrRim("20 Ludwig 7 5x17 5x112 ET35 MB66 6")).toBe(
      true
    );
    expect(titleLooksLikeCompleteWheelOrRim("Komplettrad 17 Zoll")).toBe(true);
    expect(titleLooksLikeCompleteWheelOrRim("215/70 R15C 109S All Season")).toBe(false);
  });

  it("keeps stored tyre rows on the tyre leaf until the title looks like a rim", () => {
    expect(resolveAutoLeafFromTitle(AUTO_TIRES_LEAF, "205/55 R16 WinterContact")).toBe(
      AUTO_TIRES_LEAF
    );
    expect(
      resolveAutoLeafFromTitle(AUTO_TIRES_LEAF, "17 Fritz 9 0x21 5x112 ET45 MB66 6")
    ).toBe(AUTO_COMPLETE_WHEELS_LEAF);
  });
});
