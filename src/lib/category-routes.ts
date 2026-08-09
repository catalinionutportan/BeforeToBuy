import {
  ALL_CATEGORIES_ID,
  COMPARISON_COLLECTION_FILTERS,
  getCategoryById,
  getLegacyMultiParentPrimaryDepartment,
  getParentCategoryId,
  getSubcategoryById,
  isCollectionFilter,
  isLegacyMultiParentGroup,
  resolveCategoryAlias,
} from "@/lib/categories";
import type { SiteLocale } from "./i18n/locales";
import { withLangParam } from "./seo/site-url";

/** Preserve language as a query parameter; the site has no locale path prefixes. */
function addLocalePrefix(path: string, locale?: SiteLocale): string {
  return locale ? withLangParam(path, locale) : path;
}

export function departmentCategoryPath(deptId: string, locale?: SiteLocale): string {
  return addLocalePrefix(`/categories/${encodeURIComponent(deptId)}`, locale);
}

export function subcategoryCategoryPath(deptId: string, subId: string, locale?: SiteLocale): string {
  return addLocalePrefix(`/categories/${encodeURIComponent(deptId)}/${encodeURIComponent(subId)}`, locale);
}

export function collectionBrowsePath(collectionId: string, locale?: SiteLocale): string {
  return addLocalePrefix(`/compare/${encodeURIComponent(collectionId)}`, locale);
}

/** Resolve any category/collection id to its canonical browse path. */
export function categoryBrowsePath(categoryId: string, locale?: SiteLocale): string | null {
  if (!categoryId || categoryId === ALL_CATEGORIES_ID) return null;

  // Old mixed Home+Kitchen parent lands on Kitchen + Coffee (primary department).
  if (isLegacyMultiParentGroup(categoryId)) {
    const primary = getLegacyMultiParentPrimaryDepartment(categoryId);
    if (primary) return departmentCategoryPath(primary, locale);
  }

  const resolved = resolveCategoryAlias(categoryId);

  if (isCollectionFilter(resolved)) {
    return collectionBrowsePath(resolved, locale);
  }

  const sub = getSubcategoryById(resolved);
  if (sub) {
    const parentId = getParentCategoryId(resolved);
    if (parentId) return subcategoryCategoryPath(parentId, resolved, locale);
    return null;
  }

  if (getCategoryById(resolved)) {
    return departmentCategoryPath(resolved, locale);
  }

  return null;
}

export interface ValidatedCategoryRoute {
  deptId: string;
  subId?: string;
}

export function validateDepartmentRoute(deptParam: string): ValidatedCategoryRoute | null {
  const resolvedDept = resolveCategoryAlias(deptParam);
  if (!getCategoryById(resolvedDept)) return null;
  return { deptId: resolvedDept };
}

export function validateSubcategoryRoute(
  deptParam: string,
  subParam: string
): ValidatedCategoryRoute | null {
  const department = validateDepartmentRoute(deptParam);
  if (!department) return null;

  const resolvedSub = resolveCategoryAlias(subParam);
  const subcategory = getSubcategoryById(resolvedSub);
  if (!subcategory) return null;

  const parentId = getParentCategoryId(resolvedSub);
  if (parentId !== department.deptId) return null;

  return { deptId: department.deptId, subId: resolvedSub };
}

export function validateCollectionRoute(collectionParam: string): string | null {
  const resolved = resolveCategoryAlias(collectionParam);
  if (!isCollectionFilter(resolved)) return null;
  if (!COMPARISON_COLLECTION_FILTERS.some((item) => item.id === resolved)) return null;
  return resolved;
}

export function canonicalDepartmentPath(deptParam: string, resolvedDeptId: string, locale?: SiteLocale): string | null {
  return deptParam === resolvedDeptId ? null : departmentCategoryPath(resolvedDeptId, locale);
}

export function canonicalSubcategoryPath(
  deptParam: string,
  subParam: string,
  resolved: ValidatedCategoryRoute,
  locale?: SiteLocale
): string | null {
  if (deptParam === resolved.deptId && subParam === resolved.subId) return null;
  if (!resolved.subId) return null;
  return subcategoryCategoryPath(resolved.deptId, resolved.subId, locale);
}
