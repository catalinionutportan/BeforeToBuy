/**
 * Same-origin guard for cookie/state-changing API routes.
 * Blocks simple CSRF that omits Origin (except same-origin navigations
 * that send sec-fetch-site: same-origin).
 */
export function hasValidRequestOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin") return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const allowedHosts = new Set<string>();

    const addHost = (value: string | null | undefined) => {
      if (!value) return;
      try {
        const host = value.includes("://") ? new URL(value).host : value;
        allowedHosts.add(host.toLowerCase());
      } catch {
        // ignore invalid host values
      }
    };

    addHost(request.url);
    addHost(request.headers.get("host"));
    addHost(request.headers.get("x-forwarded-host"));
    addHost(process.env.NEXT_PUBLIC_SITE_URL);

    if (allowedHosts.has(originHost)) return true;

    const normalizeLoopback = (host: string) =>
      host
        .replace(/^127\.0\.0\.1(?=:\d+$|$)/, "localhost")
        .replace(/^\[::1\](?=:\d+$|$)/, "localhost");

    const normalizedOrigin = normalizeLoopback(originHost);
    for (const allowed of allowedHosts) {
      if (normalizeLoopback(allowed) === normalizedOrigin) return true;
    }

    return false;
  } catch {
    return false;
  }
}
