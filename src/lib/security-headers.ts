import { cspImgSrcHosts } from "./feed-url-policy";

/**
 * Build a CSP string. Production script-src uses nonce + strict-dynamic (no unsafe-inline).
 * Development keeps unsafe-eval for React refresh and allows unsafe-inline as a fallback.
 */
export function buildContentSecurityPolicy(options: {
  nonce: string;
  isDevelopment: boolean;
  isLocalhost?: boolean;
}): string {
  const { nonce, isDevelopment, isLocalhost } = options;
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https:",
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

  const directives = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    `img-src ${imgSrc}`,
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDevelopment && !isLocalhost) {
    directives.push("upgrade-insecure-requests");
  }

  return directives
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
