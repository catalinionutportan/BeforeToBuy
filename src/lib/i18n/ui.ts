import type { SiteLocale } from "@/lib/i18n/locales";
import { enUi } from "@/lib/i18n/locales/en";
import { deUi } from "@/lib/i18n/locales/de";
import { frUi } from "@/lib/i18n/locales/fr";
import { itUi } from "@/lib/i18n/locales/it";
import { roUi } from "@/lib/i18n/locales/ro";

/**
 * Site UI copy by locale. Typed from the object itself so all keys remain available.
 * Keep locale objects structurally aligned (same keys across en/de/fr/it/ro).
 * Individual locale copy lives in ./locales/<locale>.ts.
 */
export const HOME_UI = {
  en: enUi,
  de: deUi,
  fr: frUi,
  it: itUi,
  ro: roUi,
} as const satisfies Record<SiteLocale, Record<string, string>>;

export type HomeUiStrings = (typeof HOME_UI)[SiteLocale];

export function formatUi(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => (text || '').replaceAll(`{${key}}`, String(value)),
    template,
  );
}
