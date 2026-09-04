/** Share identical pending reads only; never retain results or cache failures. */
export function createReadCoalescer(maxPending = 64) {
  const pending = new Map<string, Promise<unknown>>();
  return function read<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = pending.get(key);
    if (existing) return existing as Promise<T>;
    if (pending.size >= maxPending) return Promise.reject(new Error("Catalogue read capacity reached"));
    const request = Promise.resolve().then(operation);
    pending.set(key, request);
    const cleanup = () => { if (pending.get(key) === request) pending.delete(key); };
    void request.then(cleanup, cleanup);
    return request;
  };
}

export const coalesceCatalogRead = createReadCoalescer();
