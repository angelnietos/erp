import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'gcrm.accessToken';
const TENANT_KEY = 'gcrm.tenantId';

/**
 * Token JWT de la API en `localStorage` (persistente).
 * El interceptor HTTP añade `Authorization: Bearer …` automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class SessionTokenStorageService {
  /** Refleja si hay token guardado (p. ej. cabecera “Cerrar sesión”). */
  readonly hasSession = signal(false);

  constructor() {
    this.hasSession.set(this.getAccessToken() !== null);
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
    return localStorage.getItem(TENANT_KEY);
  }

  setTenantId(tenantId: string): void {
    localStorage.setItem(TENANT_KEY, tenantId);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TENANT_KEY);
    this.hasSession.set(false);
  }
}
