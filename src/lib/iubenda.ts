import type { SiteLocale } from "@/lib/i18n/locales";

/** Public iubenda Privacy Policy IDs per UI locale (www.beforetobuy.com). */
export const IUBENDA_PRIVACY_POLICY_IDS: Record<SiteLocale, string> = {
  en: "77602116",
  de: "99040313",
  fr: "66991435",
  it: "36899594",
  ro: "91438399",
};

export function iubendaPrivacyPolicyUrl(locale: SiteLocale): string {
  return `https://www.iubenda.com/privacy-policy/${IUBENDA_PRIVACY_POLICY_IDS[locale]}`;
}

function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/**
 * Fetch the published iubenda Privacy Policy HTML for a locale.
 * Content is owned/hosted by iubenda — do not rewrite clauses locally.
 */
export async function fetchIubendaPrivacyHtml(locale: SiteLocale): Promise<string | null> {
  const id = IUBENDA_PRIVACY_POLICY_IDS[locale];
  const response = await fetch(`https://www.iubenda.com/api/privacy-policy/${id}`, {
    next: { revalidate: 3600, tags: ["iubenda-privacy", `iubenda-privacy-${locale}`] },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { success?: boolean; content?: string };
  if (!payload.success || typeof payload.content !== "string" || !payload.content.trim()) {
    return null;
  }

  return stripUnsafeHtml(payload.content);
}
