import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (per-IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP
const AUTH_MAX_REQUESTS = 10; // 10 auth attempts per minute per IP

function getRateLimit(ip: string, maxRequests: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
}

// Periodic cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
        if (now > value.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 60 * 1000);

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    const path = request.nextUrl.pathname;
    const isAuthRoute = path === '/login' || path === '/register' || path.startsWith('/api/auth');

    const maxRequests = isAuthRoute ? AUTH_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;
    const rateLimitKey = isAuthRoute ? `auth:${ip}` : `general:${ip}`;

    const { allowed, remaining } = getRateLimit(rateLimitKey, maxRequests);

    if (!allowed) {
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

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/api/auth/:path*',
        '/dashboard/:path*',
    ],
};
