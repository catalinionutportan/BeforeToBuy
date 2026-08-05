import { describe, it, expect } from 'vitest';
import {
  categoryBrowsePath,
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
  validateDepartmentRoute,
  validateSubcategoryRoute,
} from './category-routes';

describe('Category Routes', () => {
  it("category browse paths use stable taxonomy ids", () => {
    expect(departmentCategoryPath("audio")).toBe("/categories/audio");
    expect(
      subcategoryCategoryPath("audio", "audio-headphones"),
    ).toBe("/categories/audio/audio-headphones");
    expect(collectionBrowsePath("compare-local-pickup")).toBe("/compare/compare-local-pickup");
  });

  it("categoryBrowsePath resolves departments, subcategories and collections", () => {
    expect(categoryBrowsePath("audio")).toBe("/categories/audio");
    expect(categoryBrowsePath("audio-headphones")).toBe("/categories/audio/audio-headphones");
    expect(categoryBrowsePath("sale")).toBe("/compare/sale");
    expect(categoryBrowsePath("all")).toBe(null);
  });

  it("legacy category aliases resolve to canonical v2 browse paths", () => {
    expect(categoryBrowsePath("notebooks-pcs")).toBe("/categories/computers-tablets");
    expect(categoryBrowsePath("photo-video")).toBe("/categories/photo-video-drones-optics");
  });

  it("subcategory routes validate parent/child relationships", () => {
    expect(validateDepartmentRoute("audio")).toEqual({ deptId: "audio" });
    expect(validateSubcategoryRoute("audio", "audio-headphones")).toEqual({
      deptId: "audio",
      subId: "audio-headphones",
    });
    expect(validateSubcategoryRoute("audio", "mobile-smartphones")).toBe(null);
  });

  it("legacy department params resolve to canonical department ids", () => {
    expect(validateDepartmentRoute("notebooks-pcs")).toEqual({ deptId: "computers-tablets" });
  });
});