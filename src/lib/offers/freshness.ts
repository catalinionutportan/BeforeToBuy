/** Human-readable age for offer fetch timestamps (feed/sample only). */
export function formatOfferFreshness(
  fetchedAt: string | undefined,
  nowMs: number = Date.now()
): string | null {
  if (!fetchedAt) return null;
  const then = Date.parse(fetchedAt);
  if (!Number.isFinite(then)) return null;

  const ageMs = Math.max(0, nowMs - then);
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return "Checked just now";
  if (minutes < 60) return `Checked ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `Checked ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 14) return `Checked ${days}d ago`;
  return "Checked over 2 weeks ago";
}

export function getFreshestOfferTimestamp(
  offers: Array<{ fetchedAt?: string; source?: string }>
): string | undefined {
  let best: string | undefined;
  let bestMs = -1;
  for (const offer of offers) {
    if (offer.source === "demo" || !offer.fetchedAt) continue;
    const ms = Date.parse(offer.fetchedAt);
    if (!Number.isFinite(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = offer.fetchedAt;
    }
  }
  return best;
}
