import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { isCronAuthorized, isInternalApiAuthorized } from "@/lib/internal-api-auth";
import { buildContentSecurityPolicy } from "@/lib/security-headers";
import {
  contentLengthExceedsLimit,
  MAX_CONTACT_BODY_BYTES,
  MAX_PRODUCT_QUERY_CHARS,
  clampFilterString,
} from "@/lib/request-body-limits";

function requestWithAuth(token?: string, extra?: HeadersInit): Request {
  const headers = new Headers(extra);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return new Request("https://www.beforetobuy.com/api/health", { headers });
}

describe("internal vs cron secrets", () => {
  const prevInternal = process.env.INTERNAL_API_SECRET;
  const prevCron = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.INTERNAL_API_SECRET = "internal-secret-value-aaaaaaaa";
    process.env.CRON_SECRET = "cron-secret-value-bbbbbbbb";
  });

  afterEach(() => {
    process.env.INTERNAL_API_SECRET = prevInternal;
    process.env.CRON_SECRET = prevCron;
  });

  it("does not accept CRON_SECRET for internal APIs", () => {
    expect(isInternalApiAuthorized(requestWithAuth("cron-secret-value-bbbbbbbb"))).toBe(false);
    expect(isInternalApiAuthorized(requestWithAuth("internal-secret-value-aaaaaaaa"))).toBe(true);
  });

  it("does not accept INTERNAL_API_SECRET for cron APIs", () => {
    expect(isCronAuthorized(requestWithAuth("internal-secret-value-aaaaaaaa"))).toBe(false);
    expect(isCronAuthorized(requestWithAuth("cron-secret-value-bbbbbbbb"))).toBe(true);
  });
});

describe("CSP builder", () => {
  it("uses nonce without unsafe-inline scripts in production", () => {
    const csp = buildContentSecurityPolicy({ nonce: "testnonce", isDevelopment: false });
    expect(csp).toContain("script-src 'self' 'nonce-testnonce' 'strict-dynamic'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toMatch(/style-src[^;]*nonce-/);
    expect(csp).toContain("img-src");
    expect(csp).toContain("https://www.rowenta.ro");
    expect(csp).not.toMatch(/img-src[^;]*\shttps:(;|$)/);
  });

  it("keeps unsafe-eval for development", () => {
    const csp = buildContentSecurityPolicy({ nonce: "devnonce", isDevelopment: true });
    expect(csp).toContain("'unsafe-eval'");
  });
});

describe("request body / query limits", () => {
  it("detects oversized Content-Length", () => {
    const req = new Request("https://www.beforetobuy.com/api/contact", {
      method: "POST",
      headers: { "content-length": String(MAX_CONTACT_BODY_BYTES + 1) },
    });
    expect(contentLengthExceedsLimit(req, MAX_CONTACT_BODY_BYTES)).toBe(true);
  });

  it("rejects oversized filter strings", () => {
    expect(clampFilterString("a".repeat(MAX_PRODUCT_QUERY_CHARS + 1), MAX_PRODUCT_QUERY_CHARS)).toEqual({
      ok: false,
    });
    expect(clampFilterString("ok", MAX_PRODUCT_QUERY_CHARS)).toEqual({ ok: true, value: "ok" });
  });
});
