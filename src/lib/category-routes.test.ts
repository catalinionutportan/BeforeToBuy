import assert from "node:assert/strict";
import test from "node:test";
import {
  categoryBrowsePath,
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
  validateDepartmentRoute,
  validateSubcategoryRoute,
} from "./category-routes";

test("category browse paths use stable taxonomy ids", () => {
  assert.equal(departmentCategoryPath("audio"), "/categories/audio");
  assert.equal(
    subcategoryCategoryPath("audio", "audio-headphones"),
    "/categories/audio/audio-headphones"
  );
  assert.equal(collectionBrowsePath("compare-local-pickup"), "/compare/compare-local-pickup");
});

test("categoryBrowsePath resolves departments, subcategories and collections", () => {
  assert.equal(categoryBrowsePath("audio"), "/categories/audio");
  assert.equal(categoryBrowsePath("audio-headphones"), "/categories/audio/audio-headphones");
  assert.equal(categoryBrowsePath("sale"), "/compare/sale");
  assert.equal(categoryBrowsePath("all"), null);
});

test("legacy category aliases resolve to canonical v2 browse paths", () => {
  assert.equal(categoryBrowsePath("notebooks-pcs"), "/categories/computers-tablets");
  assert.equal(categoryBrowsePath("photo-video"), "/categories/photo-video-drones-optics");
});

test("subcategory routes validate parent/child relationships", () => {
  assert.deepEqual(validateDepartmentRoute("audio"), { deptId: "audio" });
  assert.deepEqual(validateSubcategoryRoute("audio", "audio-headphones"), {
    deptId: "audio",
    subId: "audio-headphones",
  });
  assert.equal(validateSubcategoryRoute("audio", "mobile-smartphones"), null);
});

test("legacy department params resolve to canonical department ids", () => {
  assert.deepEqual(validateDepartmentRoute("notebooks-pcs"), { deptId: "computers-tablets" });
});
