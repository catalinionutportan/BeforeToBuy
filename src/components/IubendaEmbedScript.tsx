import { headers } from "next/headers";
import { IUBENDA_COOKIE_WIDGET_SRC } from "@/lib/iubenda";

/** iubenda requires this at the start of `<head>`, with our CSP nonce. */
export async function IubendaEmbedScript() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script type="text/javascript" src={IUBENDA_COOKIE_WIDGET_SRC} nonce={nonce} />
  );
}
