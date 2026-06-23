import { Injectable, signal } from '@angular/core';
import {
  normalizeTenantName,
  normalizeTenantSlug,
} from './tenant-context.util';

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
    this.tenantSlug.set(normalizeTenantSlug(this.readStored(TENANT_SLUG_KEY)));
    this.tenantName.set(normalizeTenantName(this.readStored(TENANT_NAME_KEY)));
    this.sanitizeCorruptStorage();
  }

  /** Limpia entradas corruptas de versiones anteriores (`"undefined"` como string). */
  private sanitizeCorruptStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const slug = normalizeTenantSlug(localStorage.getItem(TENANT_SLUG_KEY));
    const name = normalizeTenantName(localStorage.getItem(TENANT_NAME_KEY));
    if (!slug) {
      localStorage.removeItem(TENANT_SLUG_KEY);
      this.tenantSlug.set(null);
    }
    if (!name) {
      localStorage.removeItem(TENANT_NAME_KEY);
      this.tenantName.set(null);
    }
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
    const tenantSlug = normalizeTenantSlug(tenant.tenantSlug);
    const tenantName = normalizeTenantName(tenant.tenantName);
    if (!tenantSlug || !tenantName) {
      return;
    }
    localStorage.setItem(TENANT_ID_KEY, tenant.tenantId);
    localStorage.setItem(TENANT_SLUG_KEY, tenantSlug);
    localStorage.setItem(TENANT_NAME_KEY, tenantName);
    this.tenantSlug.set(tenantSlug);
    this.tenantName.set(tenantName);
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
