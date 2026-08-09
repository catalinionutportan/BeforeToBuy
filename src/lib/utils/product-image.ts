/**
 * Hosts explicitly allowed in next.config.ts `images.remotePatterns`.
 * Only these can go through the Next/Image optimizer — any other host gets
 * a 400 from `/_next/image` and renders as a blank box.
 */
const OPTIMIZER_ALLOWED_HOSTS = new Set([
  "images.unsplash.com",
  "c.cdnmp.net",
  "cdnmpro.com",
  "www.rowenta.ro",
  "rowenta.ro",
  "www.seentat.com",
  "seentat.com",
  "images2.productserve.com",
]);

/**
 * True when the image host is not whitelisted for the Next/Image optimizer.
 * Feed imports bring arbitrary merchant CDNs (soundhouse.ro, evomag.ro, …),
 * so unknown hosts must render via native <img> instead of breaking.
 */
export function shouldBypassImageOptimization(src: string | undefined): boolean {
  if (!src) return false;
  try {
    const url = new URL(src);
    return !OPTIMIZER_ALLOWED_HOSTS.has(url.hostname);
  } catch {
    // Relative /public paths are always safe for Next/Image.
    return false;
  }
}

/** Prefer native <img> whenever the optimizer would reject the source host. */
export function shouldUseNativeProductImage(src: string | undefined): boolean {
  return shouldBypassImageOptimization(src);
}
