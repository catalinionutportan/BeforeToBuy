import type { SiteLocale } from "@/lib/i18n/locales";

const FRESHNESS_COPY: Record<
  SiteLocale,
  {
    now: string;
    minutes: (value: number) => string;
    hours: (value: number) => string;
    days: (value: number) => string;
    old: string;
  }
> = {
  en: {
    now: "Checked just now",
    minutes: (value) => `Checked ${value}m ago`,
    hours: (value) => `Checked ${value}h ago`,
    days: (value) => `Checked ${value}d ago`,
    old: "Checked over 2 weeks ago",
  },
  de: {
    now: "Gerade geprüft",
    minutes: (value) => `Vor ${value} Min. geprüft`,
    hours: (value) => `Vor ${value} Std. geprüft`,
    days: (value) => `Vor ${value} Tagen geprüft`,
    old: "Vor über 2 Wochen geprüft",
  },
  fr: {
    now: "Vérifié à l'instant",
    minutes: (value) => `Vérifié il y a ${value} min`,
    hours: (value) => `Vérifié il y a ${value} h`,
    days: (value) => `Vérifié il y a ${value} j`,
    old: "Vérifié il y a plus de 2 semaines",
  },
  it: {
    now: "Verificato ora",
    minutes: (value) => `Verificato ${value} min fa`,
    hours: (value) => `Verificato ${value} h fa`,
    days: (value) => `Verificato ${value} g fa`,
    old: "Verificato oltre 2 settimane fa",
  },
  ro: {
    now: "Verificat chiar acum",
    minutes: (value) => `Verificat acum ${value} min`,
    hours: (value) => `Verificat acum ${value} h`,
    days: (value) => `Verificat acum ${value} zile`,
    old: "Verificat acum peste 2 săptămâni",
  },
};

/** Human-readable age for offer fetch timestamps (feed/sample only). */
export function formatOfferFreshness(
  fetchedAt: string | undefined,
  nowMs: number = Date.now(),
  locale: SiteLocale = "en"
): string | null {
  if (!fetchedAt) return null;
  const then = Date.parse(fetchedAt);
  if (!Number.isFinite(then)) return null;

  const ageMs = Math.max(0, nowMs - then);
  const minutes = Math.floor(ageMs / 60_000);
  const copy = FRESHNESS_COPY[locale];
  if (minutes < 1) return copy.now;
  if (minutes < 60) return copy.minutes(minutes);

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return copy.hours(hours);

  const days = Math.floor(hours / 24);
  if (days < 14) return copy.days(days);
  return copy.old;
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
