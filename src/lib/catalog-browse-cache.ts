import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { redisGetJson, redisSetJson } from "@/lib/redis-cache";

/** Tile counts/covers/brands change only on import — 24h keeps NAS / Node cache warm. */
const BROWSE_META_TTL_SECONDS = 86400;
/** Default CH/RO first-page ids — stay warm for 12h. */
const LEAD_IDS_TTL_SECONDS = 43200;
/** Full first-page JSON — cached for 2h in memory. */
const FIRST_PAGE_TTL_SECONDS = 7200;

export type CachedFirstBrowsePage = {
  products: unknown[];
  meta: unknown;
};

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

function memorySet(key: string, entry: MemoryEntry): void {
  // Public category/query variants must not grow process memory without a bound.
  if (memory.size >= 512 && !memory.has(key)) memory.delete(memory.keys().next().value!);
  memory.set(key, entry);
}

function redisEnabled(): boolean {
  // Vitest must not share Upstash keys with a local/dev Redis (TTL 1–2 min).
  return process.env.VITEST !== "true" && process.env.FORCE_SAMPLE_FEEDS !== "1";
}

function diskEnabled(): boolean {
  return process.env.VITEST !== "true" && process.env.FORCE_SAMPLE_FEEDS !== "1";
}

function cacheDirectory(): string {
  return process.env.BROWSE_CACHE_DIRECTORY || path.join(process.cwd(), ".cache");
}

function validEntry(value: unknown): value is MemoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<MemoryEntry>;
  return typeof entry.expiresAt === "number" && Number.isFinite(entry.expiresAt) && entry.expiresAt > Date.now() && "value" in entry;
}

function diskGet(key: string): MemoryEntry | null {
  if (!diskEnabled()) return null;
  try {
    const filename = path.join(cacheDirectory(), `${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
    if (!fs.existsSync(filename)) return null;
    const content = fs.readFileSync(filename, "utf-8");
    const parsed = JSON.parse(content);
    if (!validEntry(parsed)) {
      try {
        fs.unlinkSync(filename);
      } catch {}
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function diskSet(key: string, entry: MemoryEntry): void {
  if (!diskEnabled()) return;
  try {
    const directory = cacheDirectory();
    fs.mkdirSync(directory, { recursive: true });
    const filename = path.join(directory, `${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
    const temporary = `${filename}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(entry), { encoding: "utf-8", flag: "wx" });
      fs.renameSync(temporary, filename);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  } catch {}
}

async function cacheGet<T>(key: string): Promise<T | null> {
  const local = memoryGet<T>(key);
  if (local) return local;

  if (redisEnabled()) {
    const remote = await redisGetJson<MemoryEntry>(key);
    if (validEntry(remote)) {
      memorySet(key, remote);
      diskSet(key, remote);
      return remote.value as T;
    }
  }

  // Disk is a last-known-good fallback for the self-hosted single container.
  const disk = diskGet(key);
  if (disk) {
    memorySet(key, disk);
    return disk.value as T;
  }
  return null;
}

async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const entry = { value, expiresAt: Date.now() + ttlSeconds * 1000 };
  memorySet(key, entry);
  diskSet(key, entry);
  if (!redisEnabled()) return;
  await redisSetJson(key, entry, ttlSeconds);
}

export function browseMetaCacheKey(countryCode: string): string {
  return `catalog:browse-meta:v5:${countryCode.toUpperCase()}`;
}

export function chLeadIdsCacheKey(countryCode: string, take: number, skip: number): string {
  return `catalog:ch-lead-ids:v2:${countryCode.toUpperCase()}:${take}:${skip}`;
}

function normalizeFirstPageCategory(category?: string | null): string {
  const trimmed = category?.trim();
  return trimmed && trimmed !== "all" ? trimmed : "_all";
}

export function firstPageCacheKey(
  countryCode: string,
  limit: number,
  category?: string | null
): string {
  // Locale does not change the Supabase first-page payload — one key per market + aisle.
  return `catalog:first-page:v8:${countryCode.toUpperCase()}:${normalizeFirstPageCategory(category)}:${limit}`;
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

export async function getCachedFirstBrowsePage(
  countryCode: string,
  limit: number,
  category?: string | null
): Promise<CachedFirstBrowsePage | null> {
  return cacheGet<CachedFirstBrowsePage>(
    firstPageCacheKey(countryCode, limit, category)
  );
}

export async function setCachedFirstBrowsePage(
  countryCode: string,
  limit: number,
  value: CachedFirstBrowsePage,
  category?: string | null
): Promise<void> {
  await cacheSet(firstPageCacheKey(countryCode, limit, category), value, FIRST_PAGE_TTL_SECONDS);
}

/** Test helper — clear process-local browse cache between cases. */
export function resetCatalogBrowseCacheForTests(): void {
  memory.clear();
}
