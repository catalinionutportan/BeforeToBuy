// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { GET as getIndex } from "@/app/sitemap.xml/route";
import { GET as getPart } from "@/app/sitemaps/[file]/route";
import { readSitemapFile, sitemapUrlSet } from "./sitemap-files";

describe("file-only public sitemaps", () => {
  let directory: string;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), "btb-sitemaps-test-"));
    vi.stubEnv("SITEMAP_DIRECTORY", directory);
  });
  afterEach(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });

  it("serves concurrent cold requests without accessing catalogue services", async () => {
    const responses = await Promise.all([getIndex(), getIndex()]);
    for (const response of responses) {
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/xml");
      expect(await response.text()).toContain("<urlset");
    }
  });
  it("serves a completed index and immutable shard", async () => {
    const xml = sitemapUrlSet([{ url: "https://www.beforetobuy.com/?country=CH&lang=de" }]);
    await writeFile(path.join(directory, "index.xml"), "<sitemapindex />");
    await writeFile(path.join(directory, "sitemap-abc-0.xml"), xml);
    expect(await (await getIndex()).text()).toBe("<sitemapindex />");
    const response = await getPart(new Request("https://example.test"), { params: Promise.resolve({ file: "sitemap-abc-0.xml" }) });
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    expect(await response.text()).toContain("country=CH&amp;lang=de");
  });
  it("rejects traversal, temporary files and missing shards", async () => {
    for (const file of ["../.env.local", "index-abc.tmp", "sitemap-abc-0.xml", "index.xml"]) {
      expect((await getPart(new Request("https://example.test"), { params: Promise.resolve({ file }) })).status).toBe(404);
    }
    expect(await readSitemapFile("../index.xml")).toBeNull();
  });
});
