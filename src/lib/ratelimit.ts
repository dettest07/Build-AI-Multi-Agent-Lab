/**
 * Minimal fixed-window rate limiter (in-memory, per process).
 * Fine for the single-instance standalone Node deploy (@astrojs/node);
 * if we ever scale horizontally this must move to a shared store.
 */
const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 1000;

/** Returns true when the request is allowed, false when the limit is hit. */
export function allow(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // crude cleanup so the map cannot grow unbounded
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return true;
}