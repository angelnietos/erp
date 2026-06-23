import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'gcrm.accessToken';
const TENANT_ID_KEY = 'gcrm.tenantId';
const TENANT_SLUG_KEY = 'gcrm.tenantSlug';
const TENANT_NAME_KEY = 'gcrm.tenantName';

/**
 * Token JWT de la API en `localStorage` (persistente).
 * El interceptor HTTP añade `Authorization: Bearer …` automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class SessionTokenStorageService {
  /** Refleja si hay token guardado (p. ej. cabecera “Cerrar sesión”). */
  readonly hasSession = signal(false);
  readonly tenantSlug = signal<string | null>(null);
  readonly tenantName = signal<string | null>(null);

  constructor() {
    this.hasSession.set(this.getAccessToken() !== null);
    this.tenantSlug.set(this.readStored(TENANT_SLUG_KEY));
    this.tenantName.set(this.readStored(TENANT_NAME_KEY));
  }

  private readStored(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const t = localStorage.getItem(STORAGE_KEY);
    return t && t.length > 0 ? t : null;
  }

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
    this.hasSession.set(true);
  }

  getTenantId(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TENANT_ID_KEY);
  }

  getTenantSlug(): string | null {
    return this.tenantSlug();
  }

  getTenantName(): string | null {
    return this.tenantName();
  }

  setTenantId(tenantId: string): void {
    localStorage.setItem(TENANT_ID_KEY, tenantId);
  }

  setTenantContext(tenant: {
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
  }): void {
    localStorage.setItem(TENANT_ID_KEY, tenant.tenantId);
    localStorage.setItem(TENANT_SLUG_KEY, tenant.tenantSlug);
    localStorage.setItem(TENANT_NAME_KEY, tenant.tenantName);
    this.tenantSlug.set(tenant.tenantSlug);
    this.tenantName.set(tenant.tenantName);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TENANT_ID_KEY);
    localStorage.removeItem(TENANT_SLUG_KEY);
    localStorage.removeItem(TENANT_NAME_KEY);
    this.hasSession.set(false);
    this.tenantSlug.set(null);
    this.tenantName.set(null);
  }
}
