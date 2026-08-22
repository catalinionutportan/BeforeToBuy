import { describe, expect, it } from "vitest";
import { isLikelyLaptopCoverTitle } from "./laptop-aisle-cover";

describe("isLikelyLaptopCoverTitle", () => {
  it("accepts clamshell Acer notebooks", () => {
    expect(isLikelyLaptopCoverTitle("Acer Swift Go 14 OLED Notebook")).toBe(true);
    expect(isLikelyLaptopCoverTitle("Acer Aspire 5 Laptop 15.6")).toBe(true);
    expect(isLikelyLaptopCoverTitle("Acer TravelMate P2")).toBe(true);
  });

  it("rejects desks, docks and Aspire desktops", () => {
    expect(isLikelyLaptopCoverTitle("Acer höhenverstellbarer Schreibtisch")).toBe(false);
    expect(isLikelyLaptopCoverTitle("Acer USB-C Docking Station")).toBe(false);
    expect(isLikelyLaptopCoverTitle("Acer Aspire TC Desktop")).toBe(false);
  });
});
