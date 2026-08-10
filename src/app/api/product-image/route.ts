import { canProxyProductImage } from "@/lib/utils/product-image";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 8_000;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(message: string, status: number): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

export async function GET(request: Request): Promise<Response> {
  const rawSrc = new URL(request.url).searchParams.get("src")?.trim();

  if (!rawSrc || rawSrc.length > 2_048 || !canProxyProductImage(rawSrc)) {
    return errorResponse("Invalid product image URL", 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(rawSrc, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://www.evomag.ro/",
        "User-Agent":
          "Mozilla/5.0 (compatible; BeforeToBuy/1.0; +https://www.beforetobuy.com)",
      },
    });
  } catch {
    return errorResponse("Product image source unavailable", 504);
  }

  if (!upstream.ok || upstream.status >= 300) {
    return errorResponse("Product image source rejected the request", 502);
  }

  const contentType = upstream.headers.get("content-type")?.split(";", 1)[0].toLowerCase();
  if (!contentType || !ALLOWED_IMAGE_TYPES.has(contentType)) {
    return errorResponse("Product image source returned invalid content", 502);
  }

  const declaredLength = Number(upstream.headers.get("content-length") || 0);
  if (declaredLength > MAX_IMAGE_BYTES) {
    return errorResponse("Product image is too large", 413);
  }

  const body = await upstream.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) {
    return errorResponse("Product image has an invalid size", 502);
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Cache-Control":
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "Content-Length": String(body.byteLength),
      "Content-Type": contentType,
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
