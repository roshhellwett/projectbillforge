import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

// ── Rate Limiter for Auth Endpoints ──
// Allows 5 login attempts per 60 seconds per IP
let loginLimiter: Ratelimit | null = null;

export function getLoginRateLimiter(): Ratelimit | null {
    const redis = getRedis();
    if (!redis) return null;

    if (!loginLimiter) {
        loginLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "60 s"),
            prefix: "billforge:login",
        });
    }

    return loginLimiter;
}

// ── Rate Limiter for API Routes ──
// Allows 30 requests per 10 seconds per IP
let apiLimiter: Ratelimit | null = null;

export function getApiRateLimiter(): Ratelimit | null {
    const redis = getRedis();
    if (!redis) return null;

    if (!apiLimiter) {
        apiLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(30, "10 s"),
            prefix: "billforge:api",
        });
    }

    return apiLimiter;
}

/** Check rate limit — returns { success, remaining } or allows if Redis unavailable */
export async function checkRateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<{ success: boolean; remaining: number }> {
    if (!limiter) return { success: true, remaining: 999 };
    try {
        const result = await limiter.limit(identifier);
        return { success: result.success, remaining: result.remaining };
    } catch {
        // If Redis is down, allow the request
        return { success: true, remaining: 999 };
    }
}
