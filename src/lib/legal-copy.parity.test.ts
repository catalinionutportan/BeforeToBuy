import { describe, expect, it } from "vitest";
import {
  buildLocalizedDataProcessors,
  buildMerchantFeedIntegrations,
  containsForbiddenPublicLegalText,
  FORBIDDEN_PUBLIC_LEGAL_PATTERNS,
  getPublicPrivacyProcessorIds,
} from "@/lib/data-processors";
import {
  getLegalCopy,
  getLocalizedDataProcessors,
} from "@/lib/legal-copy";
import { getMerchantFeedProcessorRecords, PROCESSOR_REGISTRY } from "@/lib/processor-registry";
import type { SiteLocale } from "@/lib/i18n/locales";

const LOCALES: SiteLocale[] = ["en", "de", "fr", "it", "ro"];

const FORBIDDEN_DEMO_PHRASES = [
  "comparison demo",
  "Vergleichs-Demo",
  "démo de comparaison",
  "demo comparativa",
  "demo de comparație",
];

const MERCHANT_FEED_IDS = [
  "feed-rowenta-2p",
  "feed-scule365-2p",
  "feed-seentat-awin",
  "feed-geepas-awin",
  "feed-ottocast-awin",
  "feed-babywalz-awin",
  "feed-reifencom-awin",
  "feed-evomag-2p",
];

function serializePublicProcessors(locale: SiteLocale): string {
  return JSON.stringify(getLocalizedDataProcessors(locale));
}

describe("legal copy locale parity", () => {
  it("exposes the same top-level legal section keys in all locales", () => {
    const [en, ...rest] = LOCALES.map((locale) => Object.keys(getLegalCopy(locale)).sort());
    for (const keys of rest) {
      expect(keys).toEqual(en);
    }
  });

  it("keeps public privacy processor count aligned across locales", () => {
    const lengths = LOCALES.map((locale) => getLocalizedDataProcessors(locale).length);
    expect(new Set(lengths).size).toBe(1);
    expect(lengths[0]).toBe(getPublicPrivacyProcessorIds().length);
    expect(lengths[0]).toBe(PROCESSOR_REGISTRY.length - MERCHANT_FEED_IDS.length);
  });

  it("includes Supabase in public privacy list but not merchant feed imports", () => {
    for (const locale of LOCALES) {
      const processors = getLocalizedDataProcessors(locale);
      const blob = serializePublicProcessors(locale);
      expect(blob.toLowerCase()).toContain("supabase");
      expect(blob.toLowerCase()).not.toContain("rowenta 2performant product feed");
      expect(blob.toLowerCase()).not.toContain("evomag");
      for (const id of MERCHANT_FEED_IDS) {
        expect(processors.some((p) => p.id === id)).toBe(false);
      }
    }
  });

  it("no longer positions cookies intro as a comparison demo", () => {
    for (const locale of LOCALES) {
      const intro = getLegalCopy(locale).cookies.whatWeUseBody;
      for (const phrase of FORBIDDEN_DEMO_PHRASES) {
        expect(intro).not.toContain(phrase);
      }
      expect(intro.toLowerCase()).toMatch(/price comparison|preisvergleich|comparaison de prix|confronto prezzi|comparare a prețurilor/);
    }
  });

  it("keeps public processor ids and order aligned with the registry filter", () => {
    for (const locale of LOCALES) {
      const processors = buildLocalizedDataProcessors(locale);
      expect(processors.map((p) => p.id)).toEqual(getPublicPrivacyProcessorIds());
    }
  });

  it("marks optional infrastructure services clearly", () => {
    for (const locale of LOCALES) {
      const optional = getLocalizedDataProcessors(locale).filter((p) => p.optional);
      expect(optional.map((p) => p.id).sort()).toEqual(["datadog", "resend", "upstash"]);
    }
  });

  it("shows confirmed Supabase project region only when verified", () => {
    for (const locale of LOCALES) {
      const supabase = getLocalizedDataProcessors(locale).find((p) => p.id === "supabase");
      expect(supabase?.projectRegion).toContain("eu-west-1");
      const othersWithRegion = getLocalizedDataProcessors(locale).filter(
        (p) => p.id !== "supabase" && p.projectRegion,
      );
      expect(othersWithRegion).toHaveLength(0);
    }
  });

  it("rejects placeholders, TODOs, TBD, and empty parentheses on public processor lists", () => {
    for (const locale of LOCALES) {
      const blob = serializePublicProcessors(locale);
      for (const pattern of FORBIDDEN_PUBLIC_LEGAL_PATTERNS) {
        expect(blob).not.toMatch(pattern);
      }
      expect(containsForbiddenPublicLegalText(blob)).toBe(false);
      for (const processor of getLocalizedDataProcessors(locale)) {
        const parts = [
          processor.name,
          processor.legalEntity,
          processor.roleLabel,
          processor.purpose,
          processor.projectRegion ?? "",
          processor.transferSummary ?? "",
          processor.officialDocUrl ?? "",
        ];
        for (const part of parts) {
          expect(containsForbiddenPublicLegalText(part)).toBe(false);
        }
      }
    }
  });

  it("keeps merchant feed integrations in the internal registry only", () => {
    expect(getMerchantFeedProcessorRecords()).toHaveLength(MERCHANT_FEED_IDS.length);
    for (const locale of LOCALES) {
      const feeds = buildMerchantFeedIntegrations(locale);
      expect(feeds.map((f) => f.id)).toEqual(MERCHANT_FEED_IDS);
    }
  });
});
