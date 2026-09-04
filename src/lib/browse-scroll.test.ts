import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readBrowseScrollAnchor,
  readBrowseScrollAnchorState,
  restoreBrowseScrollAnchor,
  saveBrowseScrollAnchor,
  visibleCountForBrowseAnchor,
} from "@/lib/browse-scroll";

describe("browse product anchor restoration", () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("stores the product, visible index and viewport position", () => {
    saveBrowseScrollAnchor("product-8", { visibleIndex: 7, viewportTop: 84 });

    expect(readBrowseScrollAnchor()).toBe("product-8");
    expect(readBrowseScrollAnchorState()).toEqual({
      productId: "product-8",
      visibleIndex: 7,
      viewportTop: 84,
    });
    expect(visibleCountForBrowseAnchor(readBrowseScrollAnchorState(), 100)).toBe(12);
  });

  it("renders enough cards for a previously loaded deep product", () => {
    saveBrowseScrollAnchor("product-21", { visibleIndex: 20, viewportTop: 120 });

    expect(visibleCountForBrowseAnchor(readBrowseScrollAnchorState(), 100)).toBe(21);
    expect(visibleCountForBrowseAnchor(readBrowseScrollAnchorState(), 8)).toBe(8);
  });

  it("restores the exact card to its previous viewport position", () => {
    const card = document.createElement("article");
    card.dataset.productId = "product-8";
    document.body.appendChild(card);
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
      top: 300,
      bottom: 500,
      left: 0,
      right: 200,
      width: 200,
      height: 200,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1000 });
    saveBrowseScrollAnchor("product-8", { visibleIndex: 7, viewportTop: 100 });

    expect(restoreBrowseScrollAnchor()).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1200, left: 0, behavior: "auto" });
  });
});
