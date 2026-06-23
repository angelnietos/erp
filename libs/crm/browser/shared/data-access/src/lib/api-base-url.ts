import { InjectionToken } from '@angular/core';

/** Origen del backend (sin barra final), p. ej. `http://localhost:3100`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export function joinApiUrl(baseUrl: string, relativePath: string): string {
  const b = baseUrl.replace(/\/$/, '');
  const p = relativePath.replace(/^\//, '');
  return `${b}/api/${p}`;
}
