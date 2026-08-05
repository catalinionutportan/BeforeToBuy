import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  encodePriceHistoryKvKey,
  MAX_PRICE_HISTORY_POINTS,
  PRICE_HISTORY_INDEX_KEY,
  PRICE_HISTORY_META_KEY,
  type PriceHistoryPoint,
} from "@/lib/pricing/price-history-keys";

export type PriceHistoryBackend = "memory" | "file" | "kv";

export interface PriceHistoryMeta {
  trackedOffers: number;
  totalPoints: number;
  lastSnapshotAt?: string;
  backend: PriceHistoryBackend;
}

export interface PriceHistoryStore {
  backend: PriceHistoryBackend;
  getPoints(key: string): Promise<PriceHistoryPoint[]>;
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

class KvPriceHistoryStore implements PriceHistoryStore {
  readonly backend = "kv" as const;

  private async kvClient() {
    const { kv } = await import("@vercel/kv");
    return kv;
  }

  async getPoints(key: string): Promise<PriceHistoryPoint[]> {
    try {
      const kv = await this.kvClient();
      const points = await kv.get<PriceHistoryPoint[]>(encodePriceHistoryKvKey(key));
      return [...(points ?? [])];
    } catch (error) {
      console.error("[price-history] KV read failed:", error);
      return [];
    }
  }

  async appendPoint(key: string, point: PriceHistoryPoint): Promise<boolean> {
    try {
      const kv = await this.kvClient();
      const kvKey = encodePriceHistoryKvKey(key);
      const points = (await kv.get<PriceHistoryPoint[]>(kvKey)) ?? [];
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

      await kv.set(kvKey, nextPoints);
      if (isNewKey) {
        await kv.sadd(PRICE_HISTORY_INDEX_KEY, key);
        await kv.hincrby(PRICE_HISTORY_META_KEY, "trackedOffers", 1);
      }
      await kv.hincrby(PRICE_HISTORY_META_KEY, "totalPoints", 1);
      await kv.hset(PRICE_HISTORY_META_KEY, { lastSnapshotAt: point.recordedAt });

      return true;
    } catch (error) {
      console.error("[price-history] KV write failed:", error);
      return false;
    }
  }

  async getMeta(): Promise<PriceHistoryMeta> {
    try {
      const kv = await this.kvClient();
      const [indexSize, meta] = await Promise.all([
        kv.scard(PRICE_HISTORY_INDEX_KEY),
        kv.hgetall<Record<string, string | number>>(PRICE_HISTORY_META_KEY),
      ]);

      return {
        trackedOffers: Number(indexSize ?? meta?.trackedOffers ?? 0),
        totalPoints: Number(meta?.totalPoints ?? 0),
        lastSnapshotAt:
          typeof meta?.lastSnapshotAt === "string" ? meta.lastSnapshotAt : undefined,
        backend: this.backend,
      };
    } catch (error) {
      console.error("[price-history] KV meta read failed:", error);
      return {
        trackedOffers: 0,
        totalPoints: 0,
        backend: this.backend,
      };
    }
  }

  async clear(): Promise<void> {
    try {
      const kv = await this.kvClient();
      const keys = await kv.smembers<string[]>(PRICE_HISTORY_INDEX_KEY);
      if (keys.length > 0) {
        await kv.del(
          ...keys.map((key) => encodePriceHistoryKvKey(key)),
          PRICE_HISTORY_INDEX_KEY,
          PRICE_HISTORY_META_KEY
        );
      } else {
        await kv.del(PRICE_HISTORY_INDEX_KEY, PRICE_HISTORY_META_KEY);
      }
    } catch (error) {
      console.error("[price-history] KV clear failed:", error);
    }
  }
}

let storeInstance: PriceHistoryStore | undefined;
let testStoreInstance: MemoryPriceHistoryStore | undefined;
let forceTestStore = false;

export function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function shouldUseMemoryStore(): boolean {
  return process.env.NODE_ENV === "test" || forceTestStore;
}

export function getPriceHistoryBackend(): PriceHistoryBackend {
  if (shouldUseMemoryStore()) return "memory";
  if (isKvConfigured()) return "kv";
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
    storeInstance = isKvConfigured()
      ? new KvPriceHistoryStore()
      : new FilePriceHistoryStore();
  }

  return storeInstance;
}

export function resetPriceHistoryStoreForTests(): void {
  forceTestStore = true;
  testStoreInstance = new MemoryPriceHistoryStore();
  storeInstance = undefined;
}
