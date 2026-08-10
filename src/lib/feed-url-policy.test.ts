import { describe, expect, it, vi } from "vitest";
import {
  SAFE_IMAGE_FALLBACK,
  assertFeedDownloadUrl,
  sanitizeCommercialUrl,
  sanitizeFeedImageUrl,
  sanitizeProductImageForRender,
  safeUrlForLog,
  validateFeedUrl,
} from "@/lib/feed-url-policy";

describe("feed-url-policy", () => {
  it("accepts valid HTTPS image URLs on allowlisted hosts", () => {
    const result = validateFeedUrl(
      "https://www.rowenta.ro/media/product.jpg",
      "image",
      { feedMerchantId: "ro-rowenta" }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized).toContain("www.rowenta.ro");
    }
  });

  it("rejects HTTP image URLs", () => {
    const result = validateFeedUrl("http://www.rowenta.ro/a.jpg", "image");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("non-https");
  });

  it("rejects javascript/data/file schemes", () => {
    expect(validateFeedUrl("javascript:alert(1)", "image").ok).toBe(false);
    expect(validateFeedUrl("data:text/html,hi", "commercial", { feedMerchantId: "ro-rowenta" }).ok).toBe(
      false
    );
    expect(validateFeedUrl("file:///etc/passwd", "image").ok).toBe(false);
  });

  it("rejects URLs with credentials", () => {
    const result = validateFeedUrl(
      "https://user:pass@www.rowenta.ro/a.jpg",
      "image"
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("credentials");
  });

  it("rejects unusual ports", () => {
    const result = validateFeedUrl("https://www.rowenta.ro:8443/a.jpg", "image");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("unusual-port");
  });

  it("rejects unknown image domains and falls back safely", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const sanitized = sanitizeFeedImageUrl(
      "https://evil.example/phish.jpg?token=secret",
      "ro-rowenta"
    );
    expect(sanitized).toBe(SAFE_IMAGE_FALLBACK);
    expect(warn).toHaveBeenCalled();
    const logged = String(warn.mock.calls[0]?.[0] ?? "");
    expect(logged).not.toContain("token=secret");
    expect(logged).toContain("evil.example");
    warn.mockRestore();
  });

  it("rejects commercial links outside the feed merchant network", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(sanitizeCommercialUrl("https://evil.example/buy", "ro-rowenta")).toBeNull();
    expect(
      sanitizeCommercialUrl(
        "https://event.2performant.com/events/click?aff_code=x",
        "ro-rowenta"
      )
    ).toContain("event.2performant.com");
    // Seentat must not accept 2Performant click hosts
    expect(
      sanitizeCommercialUrl(
        "https://event.2performant.com/events/click?aff_code=x",
        "gb-seentat"
      )
    ).toBeNull();
    warn.mockRestore();
  });

  it("rejects malicious redirect-style commercial hosts", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      sanitizeCommercialUrl("https://www.awin1.com.evil.example/cread.php", "gb-seentat")
    ).toBeNull();
    expect(
      sanitizeCommercialUrl("https://not-awin1.com/cread.php", "gb-seentat")
    ).toBeNull();
    warn.mockRestore();
  });

  it("allows feed download hosts and rejects unknown download hosts", () => {
    expect(() =>
      assertFeedDownloadUrl("https://productdata.awin.com/datafeed/download/x")
    ).not.toThrow();
    expect(() => assertFeedDownloadUrl("https://evil.example/feed.csv")).toThrow(
      /rejected/
    );
  });

  it("safeUrlForLog returns hostname only", () => {
    const redacted = safeUrlForLog(
      "https://productdata.awin.com/datafeed/download/SECRET_KEY/file.csv?x=1#frag"
    );
    expect(redacted).toBe("productdata.awin.com");
    expect(redacted).not.toContain("SECRET");
    expect(redacted).not.toContain("/");
  });

  it("rejects unapproved subdomains via exact host match", () => {
    expect(validateFeedUrl("https://cdn.evil.rowenta.ro/a.jpg", "image").ok).toBe(false);
    expect(validateFeedUrl("https://images.evil.example/a.jpg", "image").ok).toBe(false);
  });

  it("sanitizeProductImageForRender replaces unknown DB URLs with fallback", () => {
    expect(sanitizeProductImageForRender("https://evil.example/product.jpg")).toBe(
      SAFE_IMAGE_FALLBACK
    );
    expect(
      sanitizeProductImageForRender("https://www.rowenta.ro/media/catalog/product/x.jpg")
    ).toContain("www.rowenta.ro");
  });

  describe("sanitizeProductImageForRender hardening", () => {
    it("allows single-slash local paths only", () => {
      expect(sanitizeProductImageForRender("/images/product.jpg")).toBe("/images/product.jpg");
    });

    it("rejects protocol-relative and off-site paths", () => {
      expect(sanitizeProductImageForRender("//evil.example/x.jpg")).toBe(SAFE_IMAGE_FALLBACK);
    });

    it("rejects HTTP, credentials, unusual ports, and disallowed schemes", () => {
      expect(sanitizeProductImageForRender("http://www.rowenta.ro/a.jpg")).toBe(
        SAFE_IMAGE_FALLBACK
      );
      expect(
        sanitizeProductImageForRender("https://user:pass@www.rowenta.ro/a.jpg")
      ).toBe(SAFE_IMAGE_FALLBACK);
      expect(sanitizeProductImageForRender("https://www.rowenta.ro:8443/a.jpg")).toBe(
        SAFE_IMAGE_FALLBACK
      );
      expect(sanitizeProductImageForRender("javascript:alert(1)")).toBe(SAFE_IMAGE_FALLBACK);
      expect(sanitizeProductImageForRender("data:text/html,hi")).toBe(SAFE_IMAGE_FALLBACK);
      expect(sanitizeProductImageForRender("blob:https://example.com/u")).toBe(
        SAFE_IMAGE_FALLBACK
      );
    });

    it("rejects unapproved HTTPS hosts", () => {
      expect(sanitizeProductImageForRender("https://cdn.evil.rowenta.ro/a.jpg")).toBe(
        SAFE_IMAGE_FALLBACK
      );
    });
  });
});
