import { headers } from "next/headers";
import { toJsonLdScript } from "@/lib/seo/json-ld";

/** JSON-LD script with the per-request CSP nonce from proxy. */
export async function JsonLd({ data }: { data: unknown }) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: toJsonLdScript(data) }}
    />
  );
}
