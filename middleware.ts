import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client using Upstash REST
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let authLimiter: Ratelimit | null = null;
let generalLimiter: Ratelimit | null = null;

const intlMiddleware = createMiddleware(routing);

if (redisUrl && redisToken) {
    redis = new Redis({
        url: redisUrl,
        token: redisToken,
    });

    // 30 auth attempts per minute per IP
    authLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '60 s'),
        prefix: 'billforge:mw:auth',
    });

    // 200 requests per minute per IP
    generalLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, '60 s'),
        prefix: 'billforge:mw:general',
    });
}

export async function middleware(request: NextRequest) {
    // Railway puts the real client IP as the FIRST entry in x-forwarded-for,
    // followed by any intermediate proxies - use the first hop to get the actual user IP.
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
        ? forwardedFor.split(',').at(0)?.trim() // First hop is the real client IP
        : request.headers.get('x-real-ip') ?? 'unknown';

    const safeIp = ip ?? 'unknown';

    const path = request.nextUrl.pathname;
    const isAuthRoute = /^\/(en|hi|hi-en)?\/(login|register)/.test(path) || path.startsWith('/api/auth');

    // If Redis is not configured, bypass rate limiting
    if (!redis || !authLimiter || !generalLimiter) {
        return intlMiddleware(request);
    }

    const limiter = isAuthRoute ? authLimiter : generalLimiter;
    const identifier = isAuthRoute ? `auth:${safeIp}` : `general:${safeIp}`;

    try {
        const { success, remaining } = await limiter.limit(identifier);

        if (!success) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        const response = intlMiddleware(request);
        response.headers.set('X-RateLimit-Remaining', String(remaining));
        return response;
    } catch (e) {
        // If Redis fails, allow the request to pass through
        return intlMiddleware(request);
    }
}

export const config = {
    matcher: ['/', '/(hi|en|hi-en)/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};