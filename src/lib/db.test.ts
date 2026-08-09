import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "@/lib/db";

describe("resolveDatabaseUrl", () => {
  it("rewrites Supabase direct IPv6 host to IPv4 session pooler", () => {
    const input =
      "postgresql://postgres:secret@db.tatyicjmupzntakpmhac.supabase.co:5432/postgres";
    const resolved = resolveDatabaseUrl(input)!;
    const url = new URL(resolved);
    expect(url.hostname).toBe("aws-1-eu-west-1.pooler.supabase.com");
    expect(url.port).toBe("5432");
    expect(url.username).toBe("postgres.tatyicjmupzntakpmhac");
    expect(url.password).toBe("secret");
    expect(url.searchParams.get("sslmode")).toBe("require");
  });

  it("adds sslmode to an existing pooler URL", () => {
    const input =
      "postgresql://postgres.ref:secret@aws-1-eu-west-1.pooler.supabase.com:5432/postgres";
    const resolved = resolveDatabaseUrl(input)!;
    expect(new URL(resolved).searchParams.get("sslmode")).toBe("require");
  });
});
