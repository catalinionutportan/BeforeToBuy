import type { NextConfig } from "next";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";
const configuredDatadogSite = process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.com";
const safeDatadogSite = /^[a-z0-9.-]+$/i.test(configuredDatadogSite)
  ? configuredDatadogSite
  : "datadoghq.com";
const datadogSiteParts = safeDatadogSite.split(".");
const datadogExtension = datadogSiteParts.pop() || "com";
const datadogIntakeOrigin = `https://browser-intake-${datadogSiteParts.join("-")}.${datadogExtension}`;
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${datadogIntakeOrigin} https://*.vercel-insights.com https://*.upstash.io`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
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
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // 2Performant RO merchant product images
      { protocol: "https", hostname: "c.cdnmp.net" },
      { protocol: "https", hostname: "cdnmpro.com" },
      { protocol: "https", hostname: "www.rowenta.ro" },
      { protocol: "https", hostname: "rowenta.ro" },
      // Seentat UK (AWIN) product images
      { protocol: "https", hostname: "www.seentat.com" },
      { protocol: "https", hostname: "seentat.com" },
      // Ottocast US (AWIN) product images
      { protocol: "https", hostname: "www.ottocast.com" },
      { protocol: "https", hostname: "ottocast.com" },
      { protocol: "https", hostname: "images2.productserve.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
