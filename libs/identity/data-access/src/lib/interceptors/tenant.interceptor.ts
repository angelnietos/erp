import { HttpInterceptorFn } from '@angular/common/http';

const TENANT_STORAGE_KEY = 'tenant_id';

/** API origins that require the multi-tenant header (adjust if your backend URL differs). */
function shouldAttachTenantHeader(url: string): boolean {
  return (
    url.includes('localhost:3000') ||
    url.includes('localhost:3110') ||
    url.includes('/api/')
  );
}

export function getStoredTenantId(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(TENANT_STORAGE_KEY);
}

export function setStoredTenantId(tenantId: string): void {
  localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
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
