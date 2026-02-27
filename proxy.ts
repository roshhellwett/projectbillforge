import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

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

  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "billforge:mw:auth",
  });

  generalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "60 s"),
    prefix: "billforge:mw:general",
  });
}

export async function proxy(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",").at(0)?.trim()
    : request.headers.get("x-real-ip") ?? "unknown";

  const safeIp = ip ?? "unknown";
  const path = request.nextUrl.pathname;
  const isAuthRoute =
    /^\/(?:en|hi|hi-en)\/(?:login|register)(?:\/|$)/.test(path) ||
    /^\/(?:login|register)(?:\/|$)/.test(path) ||
    path.startsWith("/api/auth");

  if (!redis || !authLimiter || !generalLimiter) {
    return intlMiddleware(request);
  }

  const limiter = isAuthRoute ? authLimiter : generalLimiter;
  const identifier = isAuthRoute ? `auth:${safeIp}` : `general:${safeIp}`;

  try {
    const { success, remaining } = await limiter.limit(identifier);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = intlMiddleware(request);
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch {
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: ["/", "/(hi|en|hi-en)/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
