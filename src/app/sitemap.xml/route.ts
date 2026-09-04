import { fallbackSitemap, readSitemapFile } from "@/lib/seo/sitemap-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const index = await readSitemapFile("index.xml");
  return new Response(index ?? fallbackSitemap(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": index
        ? "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
        : "public, max-age=60, s-maxage=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
