import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const EVO_IMAGE =
  "https://static2.evomag.ro/img?extend=white&file=products%2F3950%2F3950911%2Fmonitor.JPG&type=auto&width=500&sign=valid-signature";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("product image proxy", () => {
  it("rejects arbitrary remote URLs without fetching them", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        `https://www.beforetobuy.com/api/product-image?src=${encodeURIComponent("https://example.com/image.jpg")}`
      )
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects redirects and HTML challenge pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 302,
          headers: { Location: "https://captcha.distinct.ro/" },
        })
      )
    );

    const response = await GET(
      new Request(
        `https://www.beforetobuy.com/api/product-image?src=${encodeURIComponent(EVO_IMAGE)}`
      )
    );

    expect(response.status).toBe(502);
  });

  it("returns and caches a valid upstream image", async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(bytes, {
          status: 200,
          headers: { "Content-Type": "image/jpeg" },
        })
      )
    );

    const response = await GET(
      new Request(
        `https://www.beforetobuy.com/api/product-image?src=${encodeURIComponent(EVO_IMAGE)}`
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toContain("s-maxage=604800");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  });
});
