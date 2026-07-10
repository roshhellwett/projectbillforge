import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.includes('/dashboard');
  if (isDashboard) {
    const token = req.cookies.get('next-auth.session-token')?.value
      || req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      const locale = pathname.startsWith('/hi') ? 'hi' : 'en';
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/',
    '/(hi|hi-en|en)/:path*',
  ]
};
