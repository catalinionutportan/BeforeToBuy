import { describe, expect, it, vi } from "vitest";
import {
  SAFE_IMAGE_FALLBACK,
  assertFeedDownloadUrl,
  rewriteStaleMerchantImageUrl,
  sanitizeCommercialUrl,
  sanitizeFeedImageUrl,
  sanitizeProductImageForRender,
  safeUrlForLog,
  validateFeedUrl,
} from "@/lib/feed-url-policy";

describe("feed-url-policy", () => {
  it("accepts DJI US catalogue images from se-cdn.djiits.com", () => {
    const url =
      "https://se-cdn.djiits.com/tpc/uploads/sku/cover/bf211fa2-cb67-4c13-b890-dc014b54b539@small.png";
    expect(sanitizeProductImageForRender(url)).toBe(url);
    expect(sanitizeFeedImageUrl(url, "us-dji")).toBe(url);
  });

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

  it("rewrites stale Seentat Magento media onto BunnyCDN", () => {
    expect(
      rewriteStaleMerchantImageUrl(
        "https://www.seentat.com/media/catalog/product/x/i/xiaomi-17t-5g-12-256gb-blue-1_1.jpg"
      )
    ).toBe("https://seentat.b-cdn.net/Graphics/Product-Images/xiaomi-17t-5g-12-256gb-blue-1_1.jpg");
    expect(
      rewriteStaleMerchantImageUrl(
        "https://www.seentat.com/media/catalog/product/t/e/test1.png"
      )
    ).toBe("https://seentat.b-cdn.net/Graphics/Product-Images/test1.jpg");

    const result = validateFeedUrl(
      "https://www.seentat.com/media/catalog/product/a/p/apple-airtag.jpg",
      "image",
      { feedMerchantId: "gb-seentat" }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.normalized).toBe(
        "https://seentat.b-cdn.net/Graphics/Product-Images/apple-airtag.jpg"
      );
    }
    expect(
      sanitizeProductImageForRender(
        "https://www.seentat.com/media/catalog/product/n/i/nikon-speedlite-sb-5000-1.png"
      )
    ).toBe("https://seentat.b-cdn.net/Graphics/Product-Images/nikon-speedlite-sb-5000-1.jpg");
  });

  it("upgrades HTTP image URLs to HTTPS", () => {
    const result = validateFeedUrl("http://www.rowenta.ro/a.jpg", "image");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.normalized).toBe("https://www.rowenta.ro/a.jpg");
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
    expect(() =>
      assertFeedDownloadUrl("https://api.2performant.com/feed/example.csv")
    ).not.toThrow();
    expect(() =>
      assertFeedDownloadUrl("https://feeds.2performant.com/feed/example.csv")
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
