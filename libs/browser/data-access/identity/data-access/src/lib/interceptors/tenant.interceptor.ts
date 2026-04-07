import { HttpInterceptorFn } from '@angular/common/http';

const TENANT_STORAGE_KEY = 'tenant_id';

const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTenantUuid(value: string | null | undefined): boolean {
  return typeof value === 'string' && TENANT_UUID_RE.test(value.trim());
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
  const tenantId = getStoredTenantId();
  if (!tenantId || !shouldAttachTenantHeader(req.url)) {
    return next(req);
  }
  if (req.headers.has('x-tenant-id')) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { 'x-tenant-id': tenantId },
    }),
  );
};
