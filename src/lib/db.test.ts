import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "@/lib/db";

describe("resolveDatabaseUrl", () => {
  it("rewrites Supabase direct host to IPv4 transaction pooler", () => {
    const input =
      "postgresql://postgres:secret@db.tatyicjmupzntakpmhac.supabase.co:5432/postgres";
    const resolved = resolveDatabaseUrl(input)!;
    const url = new URL(resolved);
    expect(url.hostname).toBe("aws-1-eu-west-1.pooler.supabase.com");
    expect(url.port).toBe("6543");
    expect(url.username).toBe("postgres.tatyicjmupzntakpmhac");
    expect(url.password).toBe("secret");
    expect(url.searchParams.get("sslmode")).toBe("require");
    expect(url.searchParams.get("pgbouncer")).toBe("true");
    expect(url.searchParams.get("connection_limit")).toBe("1");
  });

  it("upgrades session pooler :5432 to transaction :6543", () => {
    const input =
      "postgresql://postgres.ref:secret@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";
    const resolved = resolveDatabaseUrl(input)!;
    const url = new URL(resolved);
    expect(url.port).toBe("6543");
    expect(url.searchParams.get("pgbouncer")).toBe("true");
    expect(url.searchParams.get("connection_limit")).toBe("1");
  });
});
