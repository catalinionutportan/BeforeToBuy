/**
 * Instant overlay is owned by InstantProductModalHost (card data on click).
 * Returning null avoids a second modal shell stacking on top of it.
 */
export default function ProductModalLoading() {
  return null;
}
