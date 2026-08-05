import fs from "node:fs/promises";
import path from "node:path";
import {
  encodePriceHistoryKvKey,
  MAX_PRICE_HISTORY_POINTS,
  PRICE_HISTORY_INDEX_KEY,
  PRICE_HISTORY_META_KEY,
  type PriceHistoryPoint,
} from "@/lib/pricing/price-history-keys";
import { getRedis, isRedisConfigured, isKvConfigured } from "@/lib/redis";

export type PriceHistoryBackend = "memory" | "file" | "redis" | "kv";

export interface PriceHistoryMeta {
  trackedOffers: number;
  totalPoints: number;
  lastSnapshotAt?: string;
  backend: PriceHistoryBackend;
}

export interface PriceHistoryStore {
  backend: PriceHistoryBackend;
  getPoints(key: string): Promise<PriceHistoryPoint[]>;
  getMultiplePoints(keys: string[]): Promise<Map<string, PriceHistoryPoint[]>>;
  appendPoint(key: string, point: PriceHistoryPoint): Promise<boolean>;
  getMeta(): Promise<PriceHistoryMeta>;
  clear(): Promise<void>;
}

function trimPoints(points: PriceHistoryPoint[]): PriceHistoryPoint[] {
  if (points.length <= MAX_PRICE_HISTORY_POINTS) return points;
  return points.slice(points.length - MAX_PRICE_HISTORY_POINTS);
}

class MemoryPriceHistoryStore implements PriceHistoryStore {
  readonly backend = "memory" as const;
  private readonly history = new Map<string, PriceHistoryPoint[]>();

  async getPoints(key: string): Promise<PriceHistoryPoint[]> {
    return [...(this.history.get(key) ?? [])];
  }

  async getMultiplePoints(keys: string[]): Promise<Map<string, PriceHistoryPoint[]>> {
    const results = new Map<string, PriceHistoryPoint[]>();
    for (const key of keys) {
      results.set(key, [...(this.history.get(key) ?? [])]);
    }
    return results;
  }

  async appendPoint(key: string, point: PriceHistoryPoint): Promise<boolean> {
    const points = this.history.get(key) ?? [];
    const last = points[points.length - 1];

    if (
      last &&
      last.price === point.price &&
      last.totalPrice === point.totalPrice &&
      last.source === point.source
    ) {
      return false;
    }

    points.push(point);
    this.history.set(key, trimPoints(points));
    return true;
  }

  async getMeta(): Promise<PriceHistoryMeta> {
    let totalPoints = 0;
    for (const points of this.history.values()) {
      totalPoints += points.length;
    }

    const lastSnapshotAt = Array.from(this.history.values())
      .flatMap((points) => points)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
      .at(-1)?.recordedAt;

    return {
      trackedOffers: this.history.size,
      totalPoints,
      lastSnapshotAt,
      backend: this.backend,
    };
  }

  async clear(): Promise<void> {
    this.history.clear();
  }
}

interface FileStoreShape {
  offers: Record<string, PriceHistoryPoint[]>;
  meta: Omit<PriceHistoryMeta, "backend">;
}

class FilePriceHistoryStore implements PriceHistoryStore {
  readonly backend = "file" as const;
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath = path.join(process.cwd(), ".price-history", "store.json")) {
    this.filePath = filePath;
  }

  private async readStore(): Promise<FileStoreShape> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw) as FileStoreShape;
    } catch {
      return {
        offers: {},
        meta: { trackedOffers: 0, totalPoints: 0 },
      };
    }
  }

  private enqueueWrite(task: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(task, task);
    return this.writeQueue;
  }

  private async writeStore(store: FileStoreShape): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(store, null, 2), "utf8");
  }

  async getPoints(key: string): Promise<PriceHistoryPoint[]> {
    const store = await this.readStore();
    return [...(store.offers[key] ?? [])];
  }

  async getMultiplePoints(keys: string[]): Promise<Map<string, PriceHistoryPoint[]>> {
    const store = await this.readStore();
    const results = new Map<string, PriceHistoryPoint[]>();
    for (const key of keys) {
      results.set(key, [...(store.offers[key] ?? [])]);
    }
    return results;
  }

  async appendPoint(key: string, point: PriceHistoryPoint): Promise<boolean> {
    let appended = false;

    await this.enqueueWrite(async () => {
      const store = await this.readStore();
      const points = store.offers[key] ?? [];
      const last = points[points.length - 1];

      if (
        last &&
        last.price === point.price &&
        last.totalPrice === point.totalPrice &&
        last.source === point.source
      ) {
        return;
      }

      const isNewKey = points.length === 0;
      points.push(point);
      store.offers[key] = trimPoints(points);
      store.meta.totalPoints += 1;
      if (isNewKey) {
        store.meta.trackedOffers += 1;
      }
      store.meta.lastSnapshotAt = point.recordedAt;
      appended = true;
      await this.writeStore(store);
    });

    return appended;
  }

  async getMeta(): Promise<PriceHistoryMeta> {
    const store = await this.readStore();
    return {
      ...store.meta,
      backend: this.backend,
    };
  }

  async clear(): Promise<void> {
    await this.enqueueWrite(async () => {
      await this.writeStore({
        offers: {},
        meta: { trackedOffers: 0, totalPoints: 0 },
      });
    });
  }
}

class RedisPriceHistoryStore implements PriceHistoryStore {
  readonly backend = "redis" as const;

  async getPoints(key: string): Promise<PriceHistoryPoint[]> {
    try {
      const redis = getRedis();
      const points = await redis.get<PriceHistoryPoint[]>(encodePriceHistoryKvKey(key));
      return [...(points ?? [])];
    } catch (error) {
      console.error("[price-history] Redis read failed:", error);
      return [];
    }
  }

  async getMultiplePoints(keys: string[]): Promise<Map<string, PriceHistoryPoint[]>> {
    try {
      const redis = getRedis();
      const redisKeys = keys.map(encodePriceHistoryKvKey);
      const resultsArray = await Promise.all(
        redisKeys.map((k) => redis.get<PriceHistoryPoint[]>(k))
      );
      const resultMap = new Map<string, PriceHistoryPoint[]>();
      keys.forEach((originalKey, index) => {
        resultMap.set(originalKey, resultsArray[index] ?? []);
      });
      return resultMap;
    } catch (error) {
      console.error("[price-history] Redis batch read failed:", error);
      return new Map();
    }
  }

  async appendPoint(key: string, point: PriceHistoryPoint): Promise<boolean> {
    try {
      const redis = getRedis();
      const redisKey = encodePriceHistoryKvKey(key);
      const points = (await redis.get<PriceHistoryPoint[]>(redisKey)) ?? [];
      const last = points[points.length - 1];

      if (
        last &&
        last.price === point.price &&
        last.totalPrice === point.totalPrice &&
        last.source === point.source
      ) {
        return false;
      }

      const isNewKey = points.length === 0;
      const nextPoints = trimPoints([...points, point]);

      await redis.set(redisKey, nextPoints);
      if (isNewKey) {
        await redis.sadd(PRICE_HISTORY_INDEX_KEY, key);
        await redis.hincrby(PRICE_HISTORY_META_KEY, "trackedOffers", 1);
      }
      await redis.hincrby(PRICE_HISTORY_META_KEY, "totalPoints", 1);
      await redis.hset(PRICE_HISTORY_META_KEY, { lastSnapshotAt: point.recordedAt });

      return true;
    } catch (error) {
      console.error("[price-history] Redis write failed:", error);
      return false;
    }
  }

  async getMeta(): Promise<PriceHistoryMeta> {
    try {
      const redis = getRedis();
      const [indexSize, meta] = await Promise.all([
        redis.scard(PRICE_HISTORY_INDEX_KEY),
        redis.hgetall<Record<string, string | number>>(PRICE_HISTORY_META_KEY),
      ]);

      return {
        trackedOffers: Number(indexSize ?? meta?.trackedOffers ?? 0),
        totalPoints: Number(meta?.totalPoints ?? 0),
        lastSnapshotAt:
          typeof meta?.lastSnapshotAt === "string" ? meta.lastSnapshotAt : undefined,
        backend: this.backend,
      };
    } catch (error) {
      console.error("[price-history] Redis meta read failed:", error);
      return {
        trackedOffers: 0,
        totalPoints: 0,
        backend: this.backend,
      };
    }
  }

  async clear(): Promise<void> {
    try {
      const redis = getRedis();
      const keys = (await redis.smembers(PRICE_HISTORY_INDEX_KEY)) as string[];
      if (keys.length > 0) {
        await redis.del(
          ...keys.map((key) => encodePriceHistoryKvKey(key)),
          PRICE_HISTORY_INDEX_KEY,
          PRICE_HISTORY_META_KEY
        );
      } else {
        await redis.del(PRICE_HISTORY_INDEX_KEY, PRICE_HISTORY_META_KEY);
      }
    } catch (error) {
      console.error("[price-history] Redis clear failed:", error);
    }
  }
}

let storeInstance: PriceHistoryStore | undefined;
let testStoreInstance: MemoryPriceHistoryStore | undefined;
let forceTestStore = false;

export { isKvConfigured, isRedisConfigured };

function shouldUseMemoryStore(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    forceTestStore ||
    (process.env.NODE_ENV === "production" && !isRedisConfigured())
  );
}

export function getPriceHistoryBackend(): PriceHistoryBackend {
  if (shouldUseMemoryStore()) return "memory";
  if (isRedisConfigured()) return "redis";
  return "file";
}

export function getPriceHistoryStore(): PriceHistoryStore {
  if (shouldUseMemoryStore()) {
    if (!testStoreInstance) {
      testStoreInstance = new MemoryPriceHistoryStore();
    }
    return testStoreInstance;
  }

  if (!storeInstance) {
    storeInstance = isRedisConfigured()
      ? new RedisPriceHistoryStore()
      : new FilePriceHistoryStore();
  }

  return storeInstance;
}

export function resetPriceHistoryStoreForTests(): void {
  forceTestStore = true;
  testStoreInstance = new MemoryPriceHistoryStore();
  storeInstance = undefined;
}
