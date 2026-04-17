import { HttpInterceptorFn } from '@angular/common/http';

const TENANT_STORAGE_KEY = 'tenant_id';
const AUTH_TOKEN_KEY = 'auth_token';

const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTenantUuid(value: string | null | undefined): boolean {
  return typeof value === 'string' && TENANT_UUID_RE.test(value.trim());
}

/** Misma forma que en AuthService: si falta `tenant_id` en localStorage pero el JWT lo trae, reparar cabeceras API. */
function readTenantIdFromAuthToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return null;
  }
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const tid =
      typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '';
    return isTenantUuid(tid) ? tid : null;
  } catch {
    return null;
  }
}

/** Peticiones hacia la API del ERP (relativas o absolutas con `/api/`). */
function shouldAttachTenantHeader(url: string): boolean {
  return url.includes('/api/');
}

export function getStoredTenantId(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(TENANT_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  if (!isTenantUuid(raw)) {
    localStorage.removeItem(TENANT_STORAGE_KEY);
    return null;
  }
  return raw.trim();
}

export function setStoredTenantId(tenantId: string): void {
  if (!isTenantUuid(tenantId)) {
    return;
  }
  localStorage.setItem(TENANT_STORAGE_KEY, tenantId.trim());
}

export function clearStoredTenantId(): void {
  localStorage.removeItem(TENANT_STORAGE_KEY);
}

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  if (!shouldAttachTenantHeader(req.url)) {
    return next(req);
  }
  if (req.headers.has('x-tenant-id')) {
    return next(req);
  }
  let tenantId = getStoredTenantId();
  if (!tenantId) {
    tenantId = readTenantIdFromAuthToken();
    if (tenantId) {
      setStoredTenantId(tenantId);
    }
  }
  if (!tenantId) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { 'x-tenant-id': tenantId },
    }),
  );
};
