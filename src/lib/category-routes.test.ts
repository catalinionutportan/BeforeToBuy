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
    expect(departmentCategoryPath("electronics")).toBe("/categories/electronics");
    expect(
      subcategoryCategoryPath("electronics", "audio-headphones"),
    ).toBe("/categories/electronics/audio-headphones");
    expect(collectionBrowsePath("sale")).toBe("/compare/sale");
  });

  it("categoryBrowsePath resolves departments, subcategories and collections", () => {
    expect(categoryBrowsePath("electronics")).toBe("/categories/electronics");
    expect(categoryBrowsePath("audio-headphones")).toBe("/categories/electronics/audio-headphones");
    expect(categoryBrowsePath("sale")).toBe("/compare/sale");
    expect(categoryBrowsePath("all")).toBe(null);
  });

  it("legacy category aliases resolve to canonical v2 browse paths", () => {
    expect(categoryBrowsePath("notebooks-pcs")).toBe("/categories/electronics");
    expect(categoryBrowsePath("photo-video")).toBe("/categories/electronics");
    expect(categoryBrowsePath("audio")).toBe("/categories/electronics");
  });

  it("subcategory routes validate parent/child relationships", () => {
    expect(validateDepartmentRoute("electronics")).toEqual({ deptId: "electronics" });
    expect(validateSubcategoryRoute("electronics", "audio-headphones")).toEqual({
      deptId: "electronics",
      subId: "audio-headphones",
    });
    expect(validateSubcategoryRoute("electronics", "fashion-shoes")).toBe(null);
  });

  it("legacy department params resolve to canonical department ids", () => {
    expect(validateDepartmentRoute("notebooks-pcs")).toEqual({ deptId: "electronics" });
  });
});