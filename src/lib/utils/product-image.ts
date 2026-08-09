/**
 * evoMAG CDN hosts — signed query URLs that Next/Image sometimes rejects
 * (INVALID_IMAGE_OPTIMIZE_REQUEST). Prefer native <img> with no-referrer.
 */
export function shouldBypassImageOptimization(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return (
      url.hostname === "static2.evomag.ro" ||
      url.hostname === "static.evomag.ro" ||
      url.hostname === "www.evomag.ro" ||
      url.hostname === "evomag.ro" ||
      url.hostname === "c.cdnmp.net" ||
      url.hostname === "cdnmpro.com" ||
      url.hostname.endsWith(".evomag.ro")
    );
  } catch {
    return false;
  }
}

/**
 * Prefer native <img> for signed evoMAG CDN URLs so cards do not fall back to
 * blank brand placeholders when the image optimizer rejects the source.
 */
export function shouldUseNativeProductImage(src: string | undefined): boolean {
  return shouldBypassImageOptimization(src);
}
