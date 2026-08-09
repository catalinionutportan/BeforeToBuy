import { PrismaClient } from "@prisma/client";

/**
 * Supabase "direct" hosts (db.*.supabase.co) are often IPv6-only.
 * Vercel serverless is IPv4 — rewrite to the session pooler when needed.
 */
export function resolveDatabaseUrl(raw = process.env.DATABASE_URL): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const directMatch = url.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (directMatch) {
      const projectRef = directMatch[1];
      const region = process.env.SUPABASE_POOLER_REGION?.trim() || "eu-west-1";
      const prefix = process.env.SUPABASE_POOLER_PREFIX?.trim() || "aws-1";
      const password = url.password;
      const pooled = new URL(
        `postgresql://postgres.${projectRef}@${prefix}-${region}.pooler.supabase.com:5432/postgres`
      );
      pooled.password = password;
      pooled.searchParams.set("sslmode", "require");
      return pooled.toString();
    }

    if (![...url.searchParams.keys()].some((key) => key.toLowerCase() === "sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return value;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
