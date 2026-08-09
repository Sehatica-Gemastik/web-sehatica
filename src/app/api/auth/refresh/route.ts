import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  sessionCookieOptions,
} from '@/lib/backend';

export async function GET(request: NextRequest) {
  const nextValue = request.nextUrl.searchParams.get('next') ?? '/';
  const nextPath = nextValue.startsWith('/') && !nextValue.startsWith('//') ? nextValue : '/';
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const loginUrl = new URL('/login?expired=1', request.url);
  if (!refreshToken) return NextResponse.redirect(loginUrl);

  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.data?.accessToken || !payload?.data?.refreshToken) {
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete(ACCESS_COOKIE);
    redirectResponse.cookies.delete(REFRESH_COOKIE);
    return redirectResponse;
  }

  const redirectResponse = NextResponse.redirect(new URL(nextPath, request.url));
  redirectResponse.cookies.set(ACCESS_COOKIE, payload.data.accessToken, {
    ...sessionCookieOptions,
    maxAge: 15 * 60,
  });
  redirectResponse.cookies.set(REFRESH_COOKIE, payload.data.refreshToken, {
    ...sessionCookieOptions,
    maxAge: 30 * 24 * 60 * 60,
  });
  return redirectResponse;
}
