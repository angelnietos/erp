import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  customEventStatusPillKey,
  customEventStatusValueFromLabel,
  defaultTenantCatalogTheme,
  isDefaultClientTariff,
  mergeTenantCatalogTheme,
  type CustomEventStatusDefinition,
  type TenantCatalogTheme,
} from '../catalog/catalog-theme';
import { normalizeHexColor } from '../catalog/client-rail-presets';
import { defaultClientTariffPillColor } from '../catalog/status-pill-presets';

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
          this._theme.set(this.normalizeStoredTheme(stored));
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
    const payload = this.normalizeStoredTheme(theme);
    this.http
      .put<TenantCatalogTheme>(this.url, payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (stored) => {
          this._theme.set(this.normalizeStoredTheme(stored));
          this._loaded.set(true);
        },
      });
  }

  patchEventStatusColor(key: string, color: string): void {
    const normalized = normalizeHexColor(color);
    if (!normalized) {
      return;
    }
    const current = this.mergedTheme();
    const customEventStatuses = (current.customEventStatuses ?? []).map((entry) =>
      customEventStatusPillKey(entry.value) === key
        ? { ...entry, color: normalized }
        : entry,
    );
    this.saveCatalogTheme({
      ...current,
      eventStatusColors: { ...current.eventStatusColors, [key]: normalized },
      customEventStatuses,
    });
  }

  patchClientTariffColor(tariff: string, color: string): void {
    const normalized = normalizeHexColor(color);
    if (!normalized) {
      return;
    }
    const current = this.mergedTheme();
    this.saveCatalogTheme({
      ...current,
      clientTariffColors: { ...current.clientTariffColors, [tariff.trim()]: normalized },
    });
  }

  addCustomClientTariff(label: string, color?: string): boolean {
    const trimmed = label.trim();
    if (!trimmed) {
      return false;
    }
    const current = this.mergedTheme();
    if (current.clientTariffColors[trimmed]) {
      return false;
    }
    const resolved =
      normalizeHexColor(color ?? '') ??
      defaultClientTariffPillColor(trimmed);
    this.saveCatalogTheme({
      ...current,
      clientTariffColors: { ...current.clientTariffColors, [trimmed]: resolved },
    });
    return true;
  }

  removeCustomClientTariff(label: string): void {
    const trimmed = label.trim();
    if (!trimmed || isDefaultClientTariff(trimmed)) {
      return;
    }
    const current = this.mergedTheme();
    const clientTariffColors = { ...current.clientTariffColors };
    delete clientTariffColors[trimmed];
    this.saveCatalogTheme({ ...current, clientTariffColors });
  }

  addCustomEventStatus(label: string, color?: string): boolean {
    const trimmed = label.trim();
    if (!trimmed) {
      return false;
    }
    const current = this.mergedTheme();
    const value = customEventStatusValueFromLabel(trimmed);
    if (current.customEventStatuses?.some((entry) => entry.value === value)) {
      return false;
    }
    const resolved = normalizeHexColor(color ?? '') ?? '#64748B';
    const pillKey = customEventStatusPillKey(value);
    const entry: CustomEventStatusDefinition = {
      value,
      label: trimmed,
      color: resolved,
    };
    this.saveCatalogTheme({
      ...current,
      customEventStatuses: [...(current.customEventStatuses ?? []), entry],
      eventStatusColors: { ...current.eventStatusColors, [pillKey]: resolved },
    });
    return true;
  }

  removeCustomEventStatus(value: string): void {
    const current = this.mergedTheme();
    const customEventStatuses = (current.customEventStatuses ?? []).filter(
      (entry) => entry.value !== value,
    );
    const pillKey = customEventStatusPillKey(value);
    const eventStatusColors = { ...current.eventStatusColors };
    delete eventStatusColors[pillKey];
    this.saveCatalogTheme({ ...current, customEventStatuses, eventStatusColors });
  }

  private normalizeStoredTheme(stored?: TenantCatalogTheme | null): TenantCatalogTheme {
    return mergeTenantCatalogTheme(stored);
  }
}
