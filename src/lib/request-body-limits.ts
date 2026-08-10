import { Transform } from "node:stream";

/** Shared body/query size guards for public APIs. */

export const MAX_CONTACT_BODY_BYTES = 32 * 1024; // 32 KiB
export const MAX_CONSENT_BODY_BYTES = 4 * 1024; // 4 KiB
export const MAX_PRODUCT_QUERY_CHARS = 200;
export const MAX_PRODUCT_FILTER_CHARS = 120;
export const MAX_JSON_FEED_BYTES = 32 * 1024 * 1024; // 32 MiB — Galaxus / JSON feeds

/**
 * Returns true when Content-Length exceeds the limit.
 * Missing/invalid Content-Length is allowed (streaming guard still applies on read).
 */
export function contentLengthExceedsLimit(
  request: Request,
  maxBytes: number
): boolean {
  const header = request.headers.get("content-length");
  if (!header) return false;
  const length = Number.parseInt(header, 10);
  return Number.isFinite(length) && length > maxBytes;
}

export function clampFilterString(
  value: string | null | undefined,
  maxChars: number
): { ok: true; value: string | undefined } | { ok: false } {
  if (value == null) return { ok: true, value: undefined };
  if (value.length > maxChars) return { ok: false };
  return { ok: true, value };
}

/** Read request body up to maxBytes (works without Content-Length / chunked). */
export async function readRequestBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<string> {
  if (contentLengthExceedsLimit(request, maxBytes)) {
    throw new BodyTooLargeError(maxBytes);
  }

  const reader = request.body?.getReader();
  if (!reader) return "";

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new BodyTooLargeError(maxBytes);
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export class BodyTooLargeError extends Error {
  readonly maxBytes: number;

  constructor(maxBytes: number) {
    super(`Payload exceeds ${maxBytes} byte limit`);
    this.name = "BodyTooLargeError";
    this.maxBytes = maxBytes;
  }
}

/** Reject oversized JSON strings before JSON.parse. */
export function assertJsonByteLimit(raw: string, maxBytes: number): void {
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new BodyTooLargeError(maxBytes);
  }
}

/** Collect a readable stream into a UTF-8 string with a hard byte cap. */
export async function readStreamWithByteLimit(
  stream: NodeJS.ReadableStream,
  maxBytes: number
): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) {
      throw new BodyTooLargeError(maxBytes);
    }
    chunks.push(buf);
  }

  return Buffer.concat(chunks).toString("utf8");
}

/** Node transform that aborts once cumulative bytes exceed maxBytes. */
export function createByteLimitTransform(maxBytes: number): Transform {
  let total = 0;
  return new Transform({
    decodeStrings: false,
    transform(chunk: Buffer | string, encoding, callback) {
      const byteLength = Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, typeof encoding === "string" ? encoding : "utf8");
      total += byteLength;
      if (total > maxBytes) {
        callback(new BodyTooLargeError(maxBytes));
        return;
      }
      callback(null, chunk);
    },
  });
}
