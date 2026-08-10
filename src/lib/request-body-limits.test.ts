import { Readable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import {
  assertJsonByteLimit,
  BodyTooLargeError,
  createByteLimitTransform,
  MAX_JSON_FEED_BYTES,
  readRequestBodyWithLimit,
  readStreamWithByteLimit,
} from "@/lib/request-body-limits";

describe("request body byte limits", () => {
  it("readRequestBodyWithLimit enforces cap without Content-Length", async () => {
    const request = new Request("https://example.com/api/contact", {
      method: "POST",
      body: "a".repeat(100),
    });

    await expect(readRequestBodyWithLimit(request, 50)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("readStreamWithByteLimit stops chunked streams before returning", async () => {
    const stream = Readable.from(["chunk-a", "chunk-b".repeat(100)]);
    await expect(readStreamWithByteLimit(stream, 20)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("assertJsonByteLimit rejects before JSON.parse", () => {
    expect(() => assertJsonByteLimit('{"x":' + "0".repeat(200) + "}", 16)).toThrow(BodyTooLargeError);
  });

  it("createByteLimitTransform aborts oversized pipeline chunks", async () => {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      Readable.from([Buffer.from("abc"), Buffer.from("def")])
        .pipe(createByteLimitTransform(4))
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("error", (error) => {
          expect(error).toBeInstanceOf(BodyTooLargeError);
          resolve();
        })
        .on("end", () => reject(new Error("expected byte limit error")));
    });
    expect(chunks.map((chunk) => chunk.toString()).join("")).toBe("abc");
  });
});

describe("Galaxus JSON byte limits", () => {
  it("parseGalaxusJsonFeed invokes byte guard before JSON.parse", async () => {
    const limits = await import("@/lib/request-body-limits");
    const spy = vi.spyOn(limits, "assertJsonByteLimit").mockImplementation(() => {
      throw new BodyTooLargeError(1);
    });
    const { parseGalaxusJsonFeed } = await import("@/lib/feed-parser");

    expect(() => parseGalaxusJsonFeed("[]", "CH", "ch-digitec", "sample")).toThrow(
      BodyTooLargeError
    );
    expect(spy).toHaveBeenCalledWith("[]", MAX_JSON_FEED_BYTES);
    spy.mockRestore();
  });
});
