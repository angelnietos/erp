import type { CookieOptions, Response } from 'express';
import type { BffCookieNames } from './bff-session.entity';

export function bffCookieOptions(maxAgeMs: number): CookieOptions {
  const isProd = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function csrfCookieOptions(maxAgeMs: number): CookieOptions {
  const isProd = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function setBffSessionCookies(
  res: Response,
  names: BffCookieNames,
  sessionId: string,
  csrfToken: string,
  maxAgeMs: number,
): void {
  res.cookie(names.session, sessionId, bffCookieOptions(maxAgeMs));
  res.cookie(names.csrf, csrfToken, csrfCookieOptions(maxAgeMs));
}

export function clearBffSessionCookies(res: Response, names: BffCookieNames): void {
  res.clearCookie(names.session, { path: '/' });
  res.clearCookie(names.csrf, { path: '/' });
}

export function readCookie(reqCookies: Record<string, string | undefined>, name: string): string | undefined {
  const value = reqCookies[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
