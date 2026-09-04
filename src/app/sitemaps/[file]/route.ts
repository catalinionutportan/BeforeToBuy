import { readSitemapFile } from "@/lib/seo/sitemap-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const xml = file === "index.xml" ? null : await readSitemapFile(file);
  if (!xml) return new Response("Not found", { status: 404 });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
