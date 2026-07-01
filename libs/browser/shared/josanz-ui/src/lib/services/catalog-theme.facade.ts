import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  defaultTenantCatalogTheme,
  mergeTenantCatalogTheme,
  type TenantCatalogTheme,
} from '../catalog/catalog-theme';

@Injectable({ providedIn: 'root' })
export class CatalogThemeFacade {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tenant/catalog-theme';

  private readonly _theme = signal<TenantCatalogTheme>(defaultTenantCatalogTheme());
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private readonly _saving = signal(false);

  readonly theme = this._theme.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly mergedTheme = computed(() => mergeTenantCatalogTheme(this._theme()));

  loadCatalogTheme(force = false): void {
    if (this._loading() || (this._loaded() && !force)) {
      return;
    }
    this._loading.set(true);
    this.http
      .get<TenantCatalogTheme>(this.url)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (stored) => {
          this._theme.set(mergeTenantCatalogTheme(stored));
          this._loaded.set(true);
        },
        error: () => {
          this._theme.set(defaultTenantCatalogTheme());
          this._loaded.set(true);
        },
      });
  }

  saveCatalogTheme(theme: TenantCatalogTheme): void {
    this._saving.set(true);
    this.http
      .put<TenantCatalogTheme>(this.url, theme)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (stored) => {
          this._theme.set(mergeTenantCatalogTheme(stored));
          this._loaded.set(true);
        },
      });
  }

  patchEventStatusColor(
    key: keyof TenantCatalogTheme['eventStatusColors'],
    color: string,
  ): void {
    const current = this.mergedTheme();
    this.saveCatalogTheme({
      ...current,
      eventStatusColors: { ...current.eventStatusColors, [key]: color },
    });
  }

  patchClientTariffColor(tariff: string, color: string): void {
    const current = this.mergedTheme();
    this.saveCatalogTheme({
      ...current,
      clientTariffColors: { ...current.clientTariffColors, [tariff]: color },
    });
  }
}
