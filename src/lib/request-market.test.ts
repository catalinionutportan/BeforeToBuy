import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const headersMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
  headers: () => headersMock(),
}));

describe("getRequestMarketCountry", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    headersMock.mockReset();
  });

  it("prefers the market cookie over geo and default", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "btb-market-country" ? { value: "RO" } : undefined,
    });
    headersMock.mockResolvedValue({
      get: () => "CH",
    });

    const { getRequestMarketCountry } = await import("@/lib/request-market");
    await expect(getRequestMarketCountry()).resolves.toBe("RO");
  });

  it("falls back to Vercel geo country when cookie is missing", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    headersMock.mockResolvedValue({
      get: (name: string) => (name === "x-vercel-ip-country" ? "RO" : null),
    });

    const { getRequestMarketCountry } = await import("@/lib/request-market");
    await expect(getRequestMarketCountry()).resolves.toBe("RO");
  });

  it("falls back to primary live browse country when cookie and geo are absent", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    headersMock.mockResolvedValue({ get: () => null });

    const { getRequestMarketCountry } = await import("@/lib/request-market");
    // CH feeds are disabled — primary live market is RO.
    await expect(getRequestMarketCountry()).resolves.toBe("RO");
  });

  it("ignores geo for markets without live feeds", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined });
    headersMock.mockResolvedValue({
      get: (name: string) => (name === "x-vercel-ip-country" ? "CH" : null),
    });

    const { getRequestMarketCountry } = await import("@/lib/request-market");
    await expect(getRequestMarketCountry()).resolves.toBe("RO");
  });

  it("ignores stale empty-market cookies (CH has no live feeds)", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "btb-market-country" ? { value: "CH" } : undefined,
    });
    headersMock.mockResolvedValue({ get: () => null });

    const { getRequestMarketCountry } = await import("@/lib/request-market");
    await expect(getRequestMarketCountry()).resolves.toBe("RO");
  });
});
