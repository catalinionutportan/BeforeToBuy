import { assertFeedDownloadUrl, safeUrlForLog } from "@/lib/feed-url-policy";

export const MAX_FEED_REDIRECTS = 3;

/** Redact a URL to hostname only — safe for logs and thrown errors. */
export function safeFeedHost(raw: string | URL): string {
  if (raw instanceof URL) return safeUrlForLog(raw.toString());
  return safeUrlForLog(raw);
}

/**
 * Resolve redirect Location against the current URL and validate with feed-download policy.
 */
export function resolveValidatedFeedRedirect(currentUrl: URL, location: string): URL {
  const next = new URL(location, currentUrl);
  return assertFeedDownloadUrl(next.toString());
}

export type ManualRedirectFetchInit = Omit<RequestInit, "redirect"> & {
  redirect?: "manual";
};

/**
 * fetch() with redirect: manual — follows up to MAX_FEED_REDIRECTS hops after policy validation.
 */
export async function fetchFeedWithManualRedirects(
  initialUrl: string,
  init: ManualRedirectFetchInit = {}
): Promise<Response> {
  assertFeedDownloadUrl(initialUrl);
  let currentUrl = new URL(initialUrl);

  for (let hop = 0; hop <= MAX_FEED_REDIRECTS; hop++) {
    const response = await fetch(currentUrl.toString(), {
      ...init,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error(
          `Feed redirect missing Location header host=${safeFeedHost(currentUrl)} status=${response.status}`
        );
      }
      if (hop >= MAX_FEED_REDIRECTS) {
        throw new Error(
          `Feed exceeded ${MAX_FEED_REDIRECTS} redirects host=${safeFeedHost(currentUrl)}`
        );
      }
      currentUrl = resolveValidatedFeedRedirect(currentUrl, location);
      continue;
    }

    return response;
  }

  throw new Error(`Feed redirect loop host=${safeFeedHost(currentUrl)}`);
}
