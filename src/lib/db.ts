import { PrismaClient } from "@prisma/client";

/**
 * Supabase "direct" hosts (db.*.supabase.co) are often IPv6-only.
 * Session pooler (:5432) is capped at ~15 clients and exhausts under Vercel.
 * Prefer transaction pooler (:6543 + pgbouncer) with connection_limit=1.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const region = process.env.SUPABASE_POOLER_REGION?.trim() || "eu-west-1";
    const prefix = process.env.SUPABASE_POOLER_PREFIX?.trim() || "aws-1";

    const directMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (directMatch) {
      const projectRef = directMatch[1];
      const pooled = new URL(
        `postgresql://postgres.${projectRef}@${prefix}-${region}.pooler.supabase.com:6543/postgres`
      );
      pooled.password = url.password;
      pooled.searchParams.set("pgbouncer", "true");
      pooled.searchParams.set("connection_limit", "1");
      pooled.searchParams.set("sslmode", "require");
      return pooled.toString();
    }

    // Session pooler → transaction pooler (avoids EMAXCONNSESSION on Vercel).
    if (
      url.hostname.includes(".pooler.supabase.com") &&
      (url.port === "5432" || url.port === "" || url.port === "5432")
    ) {
      url.port = "6543";
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
    }

    if (![...url.searchParams.keys()].some((key) => key.toLowerCase() === "sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    if (
      url.hostname.includes(".pooler.supabase.com") &&
      url.port === "6543" &&
      !url.searchParams.has("pgbouncer")
    ) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (
      url.hostname.includes(".pooler.supabase.com") &&
      !url.searchParams.has("connection_limit")
    ) {
      url.searchParams.set("connection_limit", "1");
    }

    return url.toString();
  } catch {
    return value;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    datasources: url ? {
      db: { url },
    } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
