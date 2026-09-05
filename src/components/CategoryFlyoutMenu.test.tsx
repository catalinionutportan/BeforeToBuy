import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryFlyoutMenu } from "@/components/CategoryFlyoutMenu";

function mockCoarsePointer(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(hover: none), (pointer: coarse)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderMenu(options?: {
  coarse?: boolean;
  selectedCategory?: string;
  counts?: Record<string, number>;
  countryCode?: "CH" | "RO";
}) {
  mockCoarsePointer(options?.coarse ?? false);
  const onCategoryChange = vi.fn();
  render(
    <CategoryFlyoutMenu
      open
      onClose={vi.fn()}
      selectedCategory={options?.selectedCategory ?? "all"}
      onCategoryChange={onCategoryChange}
      categoryCounts={
        options?.counts ?? {
          "fashion-beauty-hair-care": 5_935,
          "care-hair-styling": 41,
        }
      }
      countryCode={options?.countryCode ?? "CH"}
      locale="de"
    />
  );
  return onCategoryChange;
}

describe("CategoryFlyoutMenu presentation groups", () => {
  beforeEach(() => mockCoarsePointer(false));

  it("shows one truthful CH hair option on desktop and preserves legacy selection", () => {
    renderMenu({ selectedCategory: "care-hair-styling" });

    const fashion = screen.getByRole("button", { name: /^Mode/ });
    fireEvent.mouseEnter(fashion);

    const combined = screen.getByRole("button", {
      name: /Haarpflege \+ Haarstyling.*5976/,
    });
    expect(combined.className).toContain("font-medium");
    expect(
      screen.queryByRole("button", { name: /^Haarstyling\s+41$/ })
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /^Haushaltsgeräte/ })).toBeNull();
  });

  it("keeps the combined desktop option when only the secondary member has inventory", () => {
    renderMenu({
      counts: {
        "fashion-beauty-hair-care": 0,
        "care-hair-styling": 41,
      },
    });

    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Mode/ }));
    expect(screen.getByRole("button", { name: /Haarpflege \+ Haarstyling.*41/ })).toBeTruthy();
  });

  it("uses the same combined CH option in the mobile drill-down", async () => {
    const onCategoryChange = renderMenu({ coarse: true });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Mode/ })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /^Mode/ }));
    const combined = screen.getByRole("button", {
      name: /Haarpflege \+ Haarstyling.*5976/,
    });
    fireEvent.click(combined);

    expect(onCategoryChange).toHaveBeenCalledWith("fashion-beauty-hair-care");
  });

  it("leaves the RO hair categories separate", () => {
    renderMenu({ countryCode: "RO" });

    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Mode/ }));
    expect(screen.getByRole("button", { name: /Haarpflege.*5935/ })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Haarpflege \+ Haarstyling/ })
    ).toBeNull();

    fireEvent.mouseEnter(screen.getByRole("button", { name: /^Haushaltsgeräte/ }));
    expect(screen.getByRole("button", { name: /Haarstyling.*41/ })).toBeTruthy();
  });
});
