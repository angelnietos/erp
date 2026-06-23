import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppConfigJson {
  apiBaseUrl?: string;
}

/** Resuelve la URL de `config.json` respecto a `<base href>` (despliegues en subcarpeta). */
export function configJsonHref(): string {
  const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
  return new URL('config.json', new URL(baseHref, window.location.origin)).href;
}

@Injectable({ providedIn: 'root' })
export class AppRuntimeConfig {
  private _apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  get apiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  /** Carga opcional de `config.json`; si falla o no hay campo, se mantiene el fallback. */
  async load(): Promise<void> {
    try {
      const res = await fetch(configJsonHref(), {
        cache: 'no-store',
      });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as AppConfigJson;
      if (
        typeof data.apiBaseUrl === 'string' &&
        data.apiBaseUrl.trim().length > 0
      ) {
        const trimmed = data.apiBaseUrl.trim().replace(/\/$/, '');
        try {
          const u = new URL(trimmed);
          if (u.protocol === 'http:' || u.protocol === 'https:') {
            this._apiBaseUrl = trimmed;
          }
        } catch {
          /* URL inválida: mantener fallback de environment */
        }
      }
    } catch {
      /* mantener environment */
    }
  }
}
