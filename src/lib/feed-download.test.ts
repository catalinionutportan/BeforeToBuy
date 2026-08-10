import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchFeedWithManualRedirects,
  MAX_FEED_REDIRECTS,
  resolveValidatedFeedRedirect,
} from "@/lib/feed-download";

describe("feed-download manual redirects", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects redirect Location to a disallowed host before following", () => {
    const allowed = new URL("https://productdata.awin.com/datafeed/download/apikey/file.csv");
    expect(() =>
      resolveValidatedFeedRedirect(allowed, "https://evil.example/steal.csv")
    ).toThrow(/rejected|host-not-allowlisted/i);
  });

  it("follows validated redirects up to the limit", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { Location: "https://productdata.awin.com/datafeed/download/step2.csv" },
        })
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchFeedWithManualRedirects(
      "https://productdata.awin.com/datafeed/download/step1.csv"
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("productdata.awin.com");
    expect(String(fetchMock.mock.calls[1]?.[0])).not.toContain("apikey");
  });

  it("throws when redirect limit is exceeded without leaking path segments", async () => {
    const locations = Array.from(
      { length: MAX_FEED_REDIRECTS + 1 },
      (_, index) =>
        `https://productdata.awin.com/datafeed/download/hop${index + 1}.csv?secret=1`
    );
    const fetchMock = vi.fn().mockImplementation(async () => {
      const next = locations.shift();
      if (!next) return new Response("ok", { status: 200 });
      return new Response(null, { status: 302, headers: { Location: next } });
    });
    vi.stubGlobal("fetch", fetchMock);

    let message = "";
    try {
      await fetchFeedWithManualRedirects(
        "https://productdata.awin.com/datafeed/download/start.csv?secret=1"
      );
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toMatch(/exceeded.*redirect/i);
    expect(message).not.toContain("secret=1");
    expect(message).not.toContain("/datafeed/");
    expect(message).toMatch(/host=productdata\.awin\.com/);
  });
});
