import { describe, expect, it, vi } from "vitest";
import { createReadCoalescer } from "./catalog-read-coalescer";
describe("bounded catalogue read coalescing", () => {
  it("shares concurrent identical reads but starts a fresh read after completion", async () => {
    const read = createReadCoalescer();
    let resolve!: (value: string) => void;
    const operation = vi.fn(() => new Promise<string>((done) => { resolve = done; }));
    const a = read("CH:page2", operation);
    const b = read("CH:page2", operation);
    await Promise.resolve();
    expect(operation).toHaveBeenCalledTimes(1);
    resolve("same page");
    expect(await Promise.all([a, b])).toEqual(["same page", "same page"]);
    expect(await read("CH:page2", async () => "fresh page")).toBe("fresh page");
  });
  it("does not share markets/pages/filters and bounds outstanding operations", async () => {
    const read = createReadCoalescer(1);
    let release!: () => void;
    const a = read("CH:page1", () => new Promise<void>((resolve) => { release = resolve; }));
    await expect(read("US:page1", async () => undefined)).rejects.toThrow("capacity");
    release(); await a;
    await expect(read("US:page1", async () => "US")).resolves.toBe("US");
  });
  it("releases failed reads so a retry can succeed", async () => {
    const read = createReadCoalescer();
    await expect(read("category", async () => { throw new Error("outage"); })).rejects.toThrow("outage");
    await expect(read("category", async () => "recovered")).resolves.toBe("recovered");
  });
});
