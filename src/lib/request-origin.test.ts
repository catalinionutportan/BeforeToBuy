import { describe, expect, it } from "vitest";
import { hasValidRequestOrigin } from "@/lib/request-origin";

function makeRequest(
  url: string,
  headers: Record<string, string>
): Request {
  return new Request(url, { headers });
}

describe("hasValidRequestOrigin", () => {
  it("allows same-origin sec-fetch-site without Origin", () => {
    const ok = hasValidRequestOrigin(
      makeRequest("https://www.beforetobuy.com/api/contact", {
        "sec-fetch-site": "same-origin",
        host: "www.beforetobuy.com",
      })
    );
    expect(ok).toBe(true);
  });

  it("rejects missing Origin for cross-site style requests", () => {
    const ok = hasValidRequestOrigin(
      makeRequest("https://www.beforetobuy.com/api/contact", {
        host: "www.beforetobuy.com",
      })
    );
    expect(ok).toBe(false);
  });

  it("allows matching Origin host", () => {
    const ok = hasValidRequestOrigin(
      makeRequest("https://www.beforetobuy.com/api/contact", {
        origin: "https://www.beforetobuy.com",
        host: "www.beforetobuy.com",
      })
    );
    expect(ok).toBe(true);
  });

  it("rejects mismatched Origin", () => {
    const ok = hasValidRequestOrigin(
      makeRequest("https://www.beforetobuy.com/api/contact", {
        origin: "https://evil.example",
        host: "www.beforetobuy.com",
      })
    );
    expect(ok).toBe(false);
  });
});
