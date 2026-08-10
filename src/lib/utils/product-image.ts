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

const PROXIED_PRODUCT_IMAGE_HOSTS = new Set(["static2.evomag.ro"]);

/** Only proxy signed evoMAG product assets, never arbitrary remote URLs. */
export function canProxyProductImage(src: string | undefined): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    const file = url.searchParams.get("file");

    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      PROXIED_PRODUCT_IMAGE_HOSTS.has(url.hostname) &&
      url.pathname === "/img" &&
      Boolean(file?.startsWith("products/")) &&
      Boolean(url.searchParams.get("sign"))
    );
  } catch {
    return false;
  }
}

export function resolveProductImageSrc(src: string): string;
export function resolveProductImageSrc(src: undefined): undefined;
export function resolveProductImageSrc(src: string | undefined): string | undefined;
export function resolveProductImageSrc(src: string | undefined): string | undefined {
  if (!src || !canProxyProductImage(src)) return src;
  return `/api/product-image?src=${encodeURIComponent(src)}`;
}

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
