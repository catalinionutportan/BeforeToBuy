/**
 * evoMAG CDN hosts that historically needed special handling.
 * Direct browser fetches to static2.evomag.ro often time out / fail;
 * Next/Image (`/_next/image`) proxies them successfully in production.
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
 * Always prefer Next/Image so merchant CDNs go through the optimizer proxy.
 * Native <img> to evoMAG was the production "no product photos" failure mode:
 * the CDN times out in-browser while `/_next/image` returns a valid JPEG.
 */
export function shouldUseNativeProductImage(_src: string | undefined): boolean {
  return false;
}
