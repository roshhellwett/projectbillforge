import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";



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



export async function checkRateLimit(
    limiter: Ratelimit | null,
    identifier: string
): Promise<{ success: boolean; remaining: number }> {
    if (!limiter) return { success: true, remaining: 999 };
    try {
        const result = await limiter.limit(identifier);
        return { success: result.success, remaining: result.remaining };
    } catch {
        
        return { success: true, remaining: 999 };
    }
}
