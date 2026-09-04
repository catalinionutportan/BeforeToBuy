import { cspImgSrcHosts } from "./feed-url-policy";

const configuredDatadogSite = process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.com";
const safeDatadogSite = /^[a-z0-9.-]+$/i.test(configuredDatadogSite)
  ? configuredDatadogSite
  : "datadoghq.com";
const datadogSiteParts = safeDatadogSite.split(".");
const datadogExtension = datadogSiteParts.pop() || "com";
const datadogIntakeOrigin = `https://browser-intake-${datadogSiteParts.join("-")}.${datadogExtension}`;

/**
 * Build a CSP string. Production script-src uses nonce + strict-dynamic (no unsafe-inline).
 * Development keeps unsafe-eval for React refresh and allows unsafe-inline as a fallback.
 */
export function buildContentSecurityPolicy(options: {
  nonce: string;
  isDevelopment: boolean;
}): string {
  const { nonce, isDevelopment } = options;
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://www.iubenda.com",
    "https://cdn.iubenda.com",
    "https://embeds.iubenda.com",
    ...cspImgSrcHosts(),
  ].join(" ");

  const scriptSrc = isDevelopment
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' 'unsafe-inline'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  // Production: nonce on scripts only. style-src uses unsafe-inline without nonce so
  // Tailwind/runtime inline styles are not blocked (browsers ignore unsafe-inline when
  // a nonce is also present on style-src).
  const styleSrc = isDevelopment
    ? `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`
    : `style-src 'self' 'unsafe-inline'`;

  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    `connect-src 'self' ${datadogIntakeOrigin} https://*.vercel-insights.com https://*.upstash.io https://*.iubenda.com`,
    "frame-src https://*.iubenda.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const STATIC_SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
] as const;
