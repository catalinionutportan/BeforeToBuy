import { redisGetJson, redisSetJson } from "@/lib/redis-cache";

/** Tile counts/covers/brands change only on import — 10 min is safe for browse. */
const BROWSE_META_TTL_SECONDS = 600;
/** Default CH/RO first-page ids — keep aligned with meta so market switch stays warm. */
const LEAD_IDS_TTL_SECONDS = 180;

export type CachedBrowseMeta = {
  categoryCounts: Record<string, number>;
  leafCounts: Record<string, number>;
  categoryCovers: Record<string, string>;
  countryProductCount: number;
  brandOptions: string[];
};

type MemoryEntry = { value: unknown; expiresAt: number };

const memory = new Map<string, MemoryEntry>();

function memoryGet<T>(key: string): T | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number): void {
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function redisEnabled(): boolean {
  // Vitest must not share Upstash keys with a local/dev Redis (TTL 1–2 min).
  return process.env.VITEST !== "true";
}

async function cacheGet<T>(key: string): Promise<T | null> {
  const local = memoryGet<T>(key);
  if (local) return local;
  if (!redisEnabled()) return null;
  const remote = await redisGetJson<T>(key);
  if (remote) {
    memorySet(key, remote, BROWSE_META_TTL_SECONDS);
    return remote;
  }
  return null;
}

async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  memorySet(key, value, ttlSeconds);
  if (!redisEnabled()) return;
  await redisSetJson(key, value, ttlSeconds);
}

export function browseMetaCacheKey(countryCode: string): string {
  return `catalog:browse-meta:v2:${countryCode.toUpperCase()}`;
}

export function chLeadIdsCacheKey(countryCode: string, take: number, skip: number): string {
  return `catalog:ch-lead-ids:v1:${countryCode.toUpperCase()}:${take}:${skip}`;
}

export async function getCachedBrowseMeta(
  countryCode: string
): Promise<CachedBrowseMeta | null> {
  return cacheGet<CachedBrowseMeta>(browseMetaCacheKey(countryCode));
}

export async function setCachedBrowseMeta(
  countryCode: string,
  value: CachedBrowseMeta
): Promise<void> {
  await cacheSet(browseMetaCacheKey(countryCode), value, BROWSE_META_TTL_SECONDS);
}

export async function getCachedChLeadIds(
  countryCode: string,
  take: number,
  skip: number
): Promise<string[] | null> {
  return cacheGet<string[]>(chLeadIdsCacheKey(countryCode, take, skip));
}

export async function setCachedChLeadIds(
  countryCode: string,
  take: number,
  skip: number,
  ids: string[]
): Promise<void> {
  await cacheSet(chLeadIdsCacheKey(countryCode, take, skip), ids, LEAD_IDS_TTL_SECONDS);
}

/** Test helper — clear process-local browse cache between cases. */
export function resetCatalogBrowseCacheForTests(): void {
  memory.clear();
}
