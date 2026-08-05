import {
  ALL_CATEGORIES_ID,
  COMPARISON_COLLECTION_FILTERS,
  getCategoryById,
  getParentCategoryId,
  getSubcategoryById,
  isCollectionFilter,
  resolveCategoryAlias,
} from "@/lib/categories";

export function departmentCategoryPath(deptId: string): string {
  return `/categories/${encodeURIComponent(deptId)}`;
}

export function subcategoryCategoryPath(deptId: string, subId: string): string {
  return `/categories/${encodeURIComponent(deptId)}/${encodeURIComponent(subId)}`;
}

export function collectionBrowsePath(collectionId: string): string {
  return `/compare/${encodeURIComponent(collectionId)}`;
}

/** Resolve any category/collection id to its canonical browse path. */
export function categoryBrowsePath(categoryId: string): string | null {
  if (!categoryId || categoryId === ALL_CATEGORIES_ID) return null;

  const resolved = resolveCategoryAlias(categoryId);

  if (isCollectionFilter(resolved)) {
    return collectionBrowsePath(resolved);
  }

  const sub = getSubcategoryById(resolved);
  if (sub) {
    const parentId = getParentCategoryId(resolved);
    if (parentId) return subcategoryCategoryPath(parentId, resolved);
    return null;
  }

  if (getCategoryById(resolved)) {
    return departmentCategoryPath(resolved);
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

export function canonicalDepartmentPath(deptParam: string, resolvedDeptId: string): string | null {
  return deptParam === resolvedDeptId ? null : departmentCategoryPath(resolvedDeptId);
}

export function canonicalSubcategoryPath(
  deptParam: string,
  subParam: string,
  resolved: ValidatedCategoryRoute
): string | null {
  if (deptParam === resolved.deptId && subParam === resolved.subId) return null;
  if (!resolved.subId) return null;
  return subcategoryCategoryPath(resolved.deptId, resolved.subId);
}
