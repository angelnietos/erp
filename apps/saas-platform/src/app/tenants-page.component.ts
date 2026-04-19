import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {
  TENANT_MODULE_CATALOG,
  type TenantModuleCatalogEntry,
} from './tenant-module-catalog';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  enabledModuleIds: string[];
};

@Component({
  standalone: true,
  selector: 'app-tenants-page',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shell">
      <header class="page-head">
        <p class="eyebrow">Panel de producto</p>
        <h1 class="title">Organizaciones</h1>
        <p class="lede">
          Activa o desactiva módulos por tenant. Los cambios se aplican al instante en el ERP conectado.
        </p>
      </header>

      <div class="main">
      @if (error()) {
        <div class="banner banner--error" role="alert">
          <span class="banner-icon" aria-hidden="true">!</span>
          {{ error() }}
        </div>
      }

      @if (loading()) {
        <div class="state state--loading" role="status" aria-live="polite">
          <span class="sp-loading-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          <span class="state-text">Cargando organizaciones…</span>
        </div>
      } @else if (tenants().length === 0) {
        <div class="state state--empty" role="status">
          <p class="state-empty-title">Aún no hay organizaciones</p>
          <p class="state-empty-lede">
            Cuando existan tenants en el backend, aparecerán aquí para configurar sus módulos.
          </p>
        </div>
      } @else {
        <div class="grid">
          @for (t of tenants(); track t.id) {
            <article class="tile">
              <div class="tile-accent"></div>
              <div class="tile-head">
                <div>
                  <h2 class="tenant-name">{{ t.name }}</h2>
                  <p class="tenant-slug">{{ t.slug }}</p>
                </div>
                <span class="badge">{{ countEnabled(t) }} / {{ catalog.length }}</span>
              </div>

              <p class="section-label">Módulos contratados</p>
              <div class="chip-grid" role="group" [attr.aria-label]="'Módulos para ' + t.name">
                @for (m of catalog; track m.id) {
                  <label class="chip" [class.chip--on]="isOn(t, m.id)">
                    <input
                      type="checkbox"
                      class="chip-input"
                      [ngModel]="isOn(t, m.id)"
                      (ngModelChange)="toggle(t, m.id, $event)"
                    />
                    <span class="chip-glow"></span>
                    <span class="chip-body">
                      <span class="chip-dot" [class.chip-dot--on]="isOn(t, m.id)"></span>
                      <span class="chip-label">{{ m.label }}</span>
                    </span>
                  </label>
                }
              </div>

              @if (saveErrorByTenant()[t.id]) {
                <p class="inline-error">{{ saveErrorByTenant()[t.id] }}</p>
              }

              <div class="tile-actions">
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="savingByTenant()[t.id]"
                  (click)="save(t)"
                >
                  {{ savingByTenant()[t.id] ? 'Guardando…' : 'Guardar módulos' }}
                </button>
              </div>
            </article>
          }
        </div>
      }
      </div>
    </div>
  `,
  styles: `
    :host {
      --chip-off: rgba(255, 255, 255, 0.06);
      --chip-on: rgba(0, 75, 147, 0.22);
      display: block;
      min-height: 100vh;
      font-family: var(--sp-font-sans);
      color: var(--sp-text);
      background: transparent;
    }

    .shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 3.5vw, 2rem) clamp(2rem, 5vw, 3rem);
    }

    .page-head {
      margin-bottom: clamp(1.35rem, 3.5vw, 2.25rem);
    }

    .eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--sp-muted);
    }

    .title {
      margin: 0 0 0.55rem;
      font-family: var(--sp-font-display);
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 2.85rem);
      letter-spacing: 0.02em;
      line-height: 1.04;
      background: linear-gradient(92deg, #fff 0%, rgba(255, 255, 255, 0.74) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .lede {
      margin: 0;
      max-width: 44rem;
      font-size: 0.96rem;
      line-height: 1.58;
      color: var(--sp-muted);
    }

    .main {
      padding-top: 0;
    }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.9rem 1.05rem;
      border-radius: var(--sp-radius-md);
      margin-bottom: 1.35rem;
      font-size: 0.9rem;
      line-height: 1.45;
      border: 1px solid var(--sp-line);
    }

    .banner-icon {
      flex-shrink: 0;
      width: 1.35rem;
      height: 1.35rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.8rem;
      background: rgba(230, 0, 18, 0.35);
      color: #fff;
    }

    .banner--error {
      background: rgba(230, 0, 18, 0.1);
      border-color: rgba(230, 0, 18, 0.38);
      color: var(--sp-danger-text);
    }

    .state {
      padding: clamp(2rem, 5vw, 3rem);
      text-align: center;
      color: var(--sp-muted);
      border: 1px dashed var(--sp-line);
      border-radius: var(--sp-radius-lg);
      background: linear-gradient(165deg, rgba(18, 21, 30, 0.45), rgba(8, 9, 14, 0.35));
    }

    .state--loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .state-text {
      font-size: 0.95rem;
    }

    .state--empty {
      position: relative;
      overflow: hidden;
    }

    .state--empty::before {
      content: '';
      position: absolute;
      inset: -40% -20%;
      background: radial-gradient(
        circle at 50% 30%,
        rgba(0, 75, 147, 0.12),
        transparent 55%
      );
      pointer-events: none;
    }

    .state-empty-title {
      position: relative;
      margin: 0 0 0.5rem;
      font-family: var(--sp-font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--sp-text);
    }

    .state-empty-lede {
      position: relative;
      margin: 0 auto;
      max-width: 26rem;
      font-size: 0.92rem;
      line-height: 1.55;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
      gap: clamp(1.1rem, 2.5vw, 1.85rem);
    }

    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      border-radius: var(--sp-radius-lg);
      border: 1px solid var(--sp-line);
      background: linear-gradient(168deg, var(--sp-bg2) 0%, var(--sp-surface) 100%);
      box-shadow: var(--sp-shadow);
      overflow: hidden;
      transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }

    .tile:hover {
      transform: translateY(-3px);
      border-color: var(--sp-line-strong);
      box-shadow: var(--sp-shadow), 0 0 0 1px rgba(255, 255, 255, 0.04);
    }

    .tile-accent {
      height: 3px;
      background: linear-gradient(90deg, var(--sp-accent) 0%, var(--sp-gold) 50%, var(--sp-accent) 100%);
      background-size: 200% 100%;
      animation: sp-shimmer 10s ease-in-out infinite;
    }

    .tile-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.3rem 1.3rem 0.85rem;
    }

    .tenant-name {
      margin: 0;
      font-family: var(--sp-font-display);
      font-weight: 700;
      font-size: 1.32rem;
      letter-spacing: 0.02em;
    }

    .tenant-slug {
      margin: 0.28rem 0 0;
      font-size: 0.8rem;
      color: var(--sp-muted);
      font-family: ui-monospace, 'Cascadia Code', monospace;
    }

    .badge {
      flex-shrink: 0;
      padding: 0.38rem 0.72rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--sp-gold);
      border: 1px solid rgba(201, 162, 39, 0.4);
      background: var(--sp-gold-soft);
    }

    .section-label {
      margin: 0 1.3rem 0.7rem;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--sp-muted);
    }

    .chip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.55rem;
      padding: 0 1.3rem 1.05rem;
      flex: 1;
    }

    .chip {
      position: relative;
      display: block;
      cursor: pointer;
      user-select: none;
      border-radius: var(--sp-radius-sm);
      overflow: hidden;
    }

    .chip-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .chip-input:focus-visible ~ .chip-body {
      box-shadow: var(--sp-focus);
    }

    .chip-glow {
      position: absolute;
      inset: 0;
      border-radius: var(--sp-radius-sm);
      opacity: 0;
      transition: opacity 0.2s ease;
      background: radial-gradient(circle at 50% 50%, rgba(0, 75, 147, 0.45), transparent 72%);
      pointer-events: none;
    }

    .chip:hover .chip-glow {
      opacity: 0.55;
    }

    .chip-body {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.55rem 0.72rem;
      border-radius: var(--sp-radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: var(--chip-off);
      transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    }

    .chip:hover .chip-body {
      border-color: rgba(255, 255, 255, 0.16);
    }

    .chip--on .chip-body {
      background: var(--chip-on);
      border-color: rgba(89, 168, 244, 0.45);
    }

    .chip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.28);
      flex-shrink: 0;
    }

    .chip-dot--on {
      background: var(--sp-accent-secondary);
      box-shadow: 0 0 12px rgba(89, 168, 244, 0.75);
    }

    .chip-label {
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.25;
    }

    .inline-error {
      margin: 0 1.3rem 0.8rem;
      font-size: 0.82rem;
      color: #ff8a90;
    }

    .tile-actions {
      padding: 0 1.3rem 1.3rem;
      margin-top: auto;
    }

    .btn-primary {
      width: 100%;
      padding: 0.78rem 1rem;
      border: none;
      border-radius: var(--sp-radius-sm);
      font-family: inherit;
      font-size: 0.86rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(185deg, #0a5cb8 0%, var(--sp-accent-dim) 100%);
      box-shadow: 0 8px 28px rgba(0, 75, 147, 0.32);
      transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.05);
    }

    .btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .tile-accent {
        animation: none;
        background: linear-gradient(90deg, var(--sp-accent) 0%, var(--sp-gold) 100%);
      }
    }
  `,
})
export class TenantsPageComponent {
  private readonly http = inject(HttpClient);

  readonly apiBase = environment.apiOrigin.replace(/\/$/, '');
  readonly catalog: readonly TenantModuleCatalogEntry[] = TENANT_MODULE_CATALOG;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tenants = signal<TenantRow[]>([]);

  readonly savingByTenant = signal<Record<string, boolean>>({});
  readonly saveErrorByTenant = signal<Record<string, string | undefined>>({});

  constructor() {
    void this.refresh();
  }

  countEnabled(t: TenantRow): number {
    return t.enabledModuleIds.length;
  }

  isOn(t: TenantRow, moduleId: string): boolean {
    return t.enabledModuleIds.includes(moduleId);
  }

  toggle(t: TenantRow, moduleId: string, checked: boolean): void {
    const set = new Set(t.enabledModuleIds);
    if (checked) {
      set.add(moduleId);
    } else {
      set.delete(moduleId);
    }
    this.patchTenantLocal(t.id, Array.from(set));
  }

  private patchTenantLocal(tenantId: string, enabledModuleIds: string[]): void {
    this.tenants.update((rows) =>
      rows.map((r) => (r.id === tenantId ? { ...r, enabledModuleIds } : r)),
    );
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const rows = await firstValueFrom(
        this.http.get<TenantRow[]>(`${this.apiBase}/api/platform/tenants`),
      );
      this.tenants.set(rows ?? []);
    } catch (e: unknown) {
      const msg = this.httpErrorMessage(e);
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async save(t: TenantRow): Promise<void> {
    this.savingByTenant.update((m) => ({ ...m, [t.id]: true }));
    this.saveErrorByTenant.update((m) => ({ ...m, [t.id]: undefined }));
    try {
      await firstValueFrom(
        this.http.put(`${this.apiBase}/api/platform/tenants/${t.id}/modules`, {
          enabledModuleIds: t.enabledModuleIds,
        }),
      );
    } catch (e: unknown) {
      const msg = this.httpErrorMessage(e);
      this.saveErrorByTenant.update((m) => ({ ...m, [t.id]: msg }));
    } finally {
      this.savingByTenant.update((m) => ({ ...m, [t.id]: false }));
    }
  }

  private httpErrorMessage(e: unknown): string {
    if (e && typeof e === 'object' && 'error' in e) {
      const err = (e as { error?: unknown }).error;
      if (typeof err === 'string' && err.trim()) {
        return err;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        const m = (err as { message?: unknown }).message;
        if (typeof m === 'string' && m.trim()) {
          return m;
        }
      }
    }
    if (e && typeof e === 'object' && 'message' in e) {
      const m = (e as { message?: unknown }).message;
      if (typeof m === 'string' && m.trim()) {
        return m;
      }
    }
    return 'Error de red o del servidor. Comprueba que el backend esté en marcha y que la sesión sea válida.';
  }
}
