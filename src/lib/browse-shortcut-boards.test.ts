import { describe, expect, it } from "vitest";
import { resolveShortcutBoards, buildCategoryCoverMap } from "@/lib/browse-shortcut-boards";

describe("browse shortcut boards", () => {
  it("builds CH electronics + baby boards only from occupied leaves", () => {
    const boards = resolveShortcutBoards("CH", {
      "notebooks-laptops": 73,
      "notebooks-desktops": 9,
      "notebooks-monitors": 33,
      "tv-projectors": 14,
      "office-home": 2,
      "baby-strollers-travel": 40,
      "baby-nursery": 18,
      "fashion-beauty-hair-care": 12,
      "auto-tires-wheels": 80,
      "auto-oils-fluids": 6,
    });

    expect(boards.map((board) => board.id)).toEqual(["electronics", "auto", "baby", "beauty"]);
    expect(boards[1]?.tiles.map((tile) => tile.categoryId)).toEqual([
      "auto-tires-wheels",
      "auto-oils-fluids",
    ]);
    expect(boards[0]?.tiles.map((tile) => tile.categoryId)).toEqual([
      "notebooks-laptops",
      "notebooks-desktops",
      "notebooks-monitors",
      "tv-projectors",
      "office-home",
    ]);
    expect(boards[2]?.featured).toBe(true);
    expect(boards[2]?.tiles.map((tile) => tile.categoryId)).toEqual([
      "baby-strollers-travel",
      "baby-nursery",
    ]);
    expect(boards[2]?.tiles.some((tile) => tile.categoryId === "mobile-feature-phones")).toBe(
      false
    );
  });

  it("hides boards when inventory is unknown or empty", () => {
    expect(resolveShortcutBoards("CH", undefined)).toEqual([]);
    expect(resolveShortcutBoards("CH", { "mobile-feature-phones": 0 })).toEqual([]);
  });

  it("builds RO home + DIY boards from live appliance and tool leaves", () => {
    const boards = resolveShortcutBoards("RO", {
      "cleaning-vacuums": 20,
      "care-hair-styling": 8,
      "diy-power-tools": 40,
      "diy-hand-tools": 15,
    });
    expect(boards.map((board) => board.id)).toEqual(["home", "diy"]);
    expect(boards[0]?.tiles[0]?.categoryId).toBe("cleaning-vacuums");
    expect(boards[1]?.tiles[0]?.categoryId).toBe("diy-power-tools");
    expect(boards.some((board) => board.id === "auto")).toBe(false);
  });

  it("omits the CH Auto board when Reifen leaves are empty", () => {
    const boards = resolveShortcutBoards("CH", {
      "notebooks-laptops": 10,
      "baby-strollers-travel": 4,
    });
    expect(boards.map((board) => board.id)).toEqual(["electronics", "baby"]);
  });

  it("drops tiles and boards that have no product photo", () => {
    const boards = resolveShortcutBoards(
      "CH",
      {
        "notebooks-laptops": 73,
        "baby-strollers-travel": 40,
        "auto-tires-wheels": 80,
        "fashion-beauty-hair-care": 12,
      },
      {
        "notebooks-laptops": "https://images2.productserve.com/laptop.jpg",
        "baby-strollers-travel": "https://images2.productserve.com/stroller.jpg",
      }
    );
    expect(boards.map((board) => board.id)).toEqual(["electronics", "baby"]);
    expect(boards[0]?.tiles).toEqual([{ categoryId: "notebooks-laptops", count: 73 }]);
    expect(boards[0]?.featured).toBe(true);
  });

  it("keeps the first product image per occupied leaf", () => {
    expect(
      buildCategoryCoverMap([
        { category: "cleaning-stick-vacuums", image: "https://cdn.example/stick.jpg" },
        { category: "cleaning-stick-vacuums", image: "https://cdn.example/other.jpg" },
        { category: "diy-power-tools", image: "  " },
        { category: "diy-power-tools", image: "https://cdn.example/saw.jpg" },
      ])
    ).toEqual({
      "cleaning-stick-vacuums": "https://cdn.example/stick.jpg",
      "diy-power-tools": "https://cdn.example/saw.jpg",
    });
  });
});
