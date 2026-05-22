import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'saas_platform_token';

export const platformAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && req.url.includes('/api/')) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }
  return next(req);
};

export function getPlatformToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setPlatformToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearPlatformToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
