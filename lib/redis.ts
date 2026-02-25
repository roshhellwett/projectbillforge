import { Redis } from "@upstash/redis";

// Singleton Redis client — only instantiated if env vars are present
let redis: Redis | null = null;

export function getRedis(): Redis | null {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }

    if (!redis) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    return redis;
}

// ── Cache Helpers ──

/** Get a cached value, returns null if Redis unavailable or key missing */
export async function cacheGet<T>(key: string): Promise<T | null> {
    const r = getRedis();
    if (!r) return null;
    try {
        return await r.get<T>(key);
    } catch {
        return null;
    }
}

/** Set a cached value with TTL in seconds (default 5 min) */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
        await r.set(key, value, { ex: ttlSeconds });
    } catch {
        // Silently fail — cache is optional
    }
}

/** Delete a cached key */
export async function cacheDel(key: string): Promise<void> {
    const r = getRedis();
    if (!r) return;
    try {
        await r.del(key);
    } catch {
        // Silently fail
    }
}
