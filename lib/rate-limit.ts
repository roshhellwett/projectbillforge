import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

let loginLimiter: Ratelimit | null = null;
let warnedAboutRedis = false;
const limiters = new Map<string, Ratelimit>();

function getNamedLimiter(name: string, limit: number, window: string): Ratelimit | null {
  const cached = limiters.get(name);
  if (cached !== undefined) return cached;
  const redis = getRedis();
  if (!redis) { limiters.set(name, null!); return null; }
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`),
    prefix: `billforge:${name}`,
  });
  limiters.set(name, limiter);
  return limiter;
}

const memRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkMemRateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  const existing = memRateLimit.get(key);
  if (!existing || now > existing.resetAt) {
    memRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (existing.count >= limit) {
    return { success: false, remaining: 0 };
  }
  existing.count++;
  return { success: true, remaining: limit - existing.count };
}

function parseWindowMs(window: string): number {
  const [num, unit] = window.split(' ') as [string, string];
  const n = parseInt(num, 10);
  if (unit === 's' || unit.startsWith('sec')) return n * 1000;
  if (unit === 'm' || unit.startsWith('min')) return n * 60 * 1000;
  if (unit === 'h') return n * 3600 * 1000;
  return n * 1000;
}

export function getLoginRateLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    if (!warnedAboutRedis) {
      console.warn("[billforge] Falling back to in-memory rate limiting (no Upstash Redis). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.");
      warnedAboutRedis = true;
    }
    return null;
  }
  if (!loginLimiter) {
    loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "billforge:login",
    });
  }
  return loginLimiter;
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) {
    return checkMemRateLimit(`login:${identifier}`, 5, 60_000);
  }
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return checkMemRateLimit(`login:${identifier}`, 5, 60_000);
  }
}

export async function checkActionRateLimit(
  identifier: string,
  action: string,
  limit: number = 30,
  window: string = "60 s"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getNamedLimiter(action, limit, window);
  if (!limiter) {
    return checkMemRateLimit(`${action}:${identifier}`, limit, parseWindowMs(window));
  }
  try {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining };
  } catch {
    return checkMemRateLimit(`${action}:${identifier}`, limit, parseWindowMs(window));
  }
}
