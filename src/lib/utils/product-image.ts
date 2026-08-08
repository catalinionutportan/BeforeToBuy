/**
 * evoMAG (and similar) CDNs serve signed URLs with query strings.
 * Vercel/Next `_next/image` often fails those with INVALID_IMAGE_OPTIMIZE_REQUEST
 * even when the source URL returns a valid image/jpeg to browsers.
 */
export function shouldBypassImageOptimization(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return (
      url.hostname === "static2.evomag.ro" ||
      url.hostname === "static.evomag.ro" ||
      url.hostname === "www.evomag.ro" ||
      url.hostname === "evomag.ro"
    );
  } catch {
    return false;
  }
}

/**
 * Prefer native <img> for signed merchant CDNs.
 * Next/Image still flakes on many static2.evomag.ro URLs even with unoptimized.
 */
export function shouldUseNativeProductImage(src: string | undefined): boolean {
  return shouldBypassImageOptimization(src);
}
