import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => navigation,
}));

import { SearchAutocomplete } from "@/components/SearchAutocomplete";

const CATEGORY_OPTIONS = [
  { id: "hub-diy", label: "DIY + Tools", count: 20 },
  { id: "care-hair-styling", label: "Rowenta hair styling", count: 8 },
];

describe("SearchAutocomplete keyboard intent", () => {
  it("submits the typed query after Escape instead of a stale hovered category", () => {
    const onSearchSubmit = vi.fn();
    const onCategorySelect = vi.fn();
    render(
      <SearchAutocomplete
        onSearchSubmit={onSearchSubmit}
        onCategorySelect={onCategorySelect}
        categoryOptions={CATEGORY_OPTIONS}
        countryCode="RO"
        locale="en"
      />
    );

    const input = screen.getByRole("combobox", { name: /Search products/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rowenta" } });
    fireEvent.mouseEnter(screen.getByRole("option", { name: /Rowenta hair styling/ }));

    // Keep both key events in one React batch to reproduce the stale-state race.
    let escapeAccepted = true;
    act(() => {
      escapeAccepted = input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      );
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
    });

    expect(escapeAccepted).toBe(false);
    expect((input as HTMLInputElement).value).toBe("rowenta");
    expect(onCategorySelect).not.toHaveBeenCalled();
    fireEvent.submit(input.closest("form")!);
    expect(onSearchSubmit).toHaveBeenCalledWith("rowenta");
  });

  it("still opens a category through normal ArrowDown and Enter navigation", () => {
    const onCategorySelect = vi.fn();
    render(
      <SearchAutocomplete
        onCategorySelect={onCategorySelect}
        categoryOptions={CATEGORY_OPTIONS}
        countryCode="RO"
        locale="en"
      />
    );

    const input = screen.getByRole("combobox", { name: /Search products/i });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCategorySelect).toHaveBeenCalledWith("hub-diy");
  });
});
