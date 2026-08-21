import { headers } from "next/headers";
import { IUBENDA_COOKIE_WIDGET_SRC } from "@/lib/iubenda";

/**
 * iubenda wants this in `<head>` so their scanner sees the snippet.
 * `async` is required: a blocking widget JS held first paint for ~10s.
 */
export async function IubendaEmbedScript() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      type="text/javascript"
      src={IUBENDA_COOKIE_WIDGET_SRC}
      nonce={nonce}
      async
    />
  );
}
