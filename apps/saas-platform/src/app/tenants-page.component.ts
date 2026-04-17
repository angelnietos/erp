import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { clearPlatformToken } from './platform-auth.interceptor';
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
      <header class="top">
        <div class="brand">
          <span class="brand-mark">JOSANZ</span>
          <span class="brand-sub">PLATFORM</span>
        </div>
        <div class="top-meta">
          <p class="eyebrow">Panel de producto</p>
          <h1 class="title">Tenants</h1>
          <p class="lede">
            Activa o desactiva módulos por organización. Los cambios se aplican al instante en el ERP conectado.
          </p>
        </div>
        <button type="button" class="btn-logout" (click)="logout()">
          <span class="btn-logout-icon" aria-hidden="true">⏻</span>
          Salir
        </button>
      </header>

      @if (error()) {
        <div class="banner banner--error" role="alert">{{ error() }}</div>
      }

      @if (loading()) {
        <div class="state state--loading">Cargando organizaciones…</div>
      } @else if (tenants().length === 0) {
        <div class="state">No hay tenants.</div>
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
  `,
  styles: `
    :host {
      --bg0: #06070b;
      --bg1: #0c0e14;
      --bg2: #12151e;
      --line: rgba(255, 255, 255, 0.08);
      --muted: rgba(232, 234, 239, 0.55);
      --text: #e8eaef;
      --accent: #e60012;
      --accent-dim: #9a0010;
      --gold: #c9a227;
      --chip-off: rgba(255, 255, 255, 0.06);
      --chip-on: rgba(230, 0, 18, 0.18);
      --shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
      display: block;
      min-height: 100vh;
      font-family: 'DM Sans', system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(1200px 600px at 10% -10%, rgba(230, 0, 18, 0.12), transparent 55%),
        radial-gradient(900px 500px at 90% 0%, rgba(201, 162, 39, 0.08), transparent 50%),
        linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 40%, #0a0b10 100%);
    }

    .shell {
      max-width: 1280px;
      margin: 0 auto;
      padding: clamp(1.25rem, 4vw, 2.5rem);
    }

    .top {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: clamp(1rem, 3vw, 2rem);
      align-items: start;
      padding-bottom: clamp(1.5rem, 4vw, 2.5rem);
      border-bottom: 1px solid var(--line);
      margin-bottom: clamp(1.25rem, 3vw, 2rem);
    }

    @media (max-width: 720px) {
      .top {
        grid-template-columns: 1fr;
      }
    }

    .brand {
      display: flex;
      flex-direction: column;
      line-height: 1;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent);
      align-self: start;
    }

    .brand-mark {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: 0.12em;
      color: var(--text);
    }

    .brand-sub {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 600;
      font-size: 0.7rem;
      letter-spacing: 0.35em;
      color: var(--gold);
    }

    .top-meta {
      min-width: 0;
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .title {
      margin: 0 0 0.5rem;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 3rem);
      letter-spacing: 0.02em;
      line-height: 1.05;
      background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.75) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .lede {
      margin: 0;
      max-width: 42rem;
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--muted);
    }

    .btn-logout {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border: 1px solid rgba(230, 0, 18, 0.45);
      border-radius: 6px;
      background: linear-gradient(180deg, rgba(230, 0, 18, 0.25), rgba(154, 0, 16, 0.35));
      color: var(--text);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      box-shadow: 0 4px 20px rgba(230, 0, 18, 0.15);
      justify-self: end;
      white-space: nowrap;
    }

    .btn-logout:hover {
      transform: translateY(-1px);
      border-color: rgba(255, 80, 90, 0.7);
      box-shadow: 0 8px 28px rgba(230, 0, 18, 0.25);
    }

    .btn-logout-icon {
      font-size: 1rem;
      opacity: 0.9;
    }

    .banner {
      padding: 0.85rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.9rem;
      border: 1px solid var(--line);
    }

    .banner--error {
      background: rgba(230, 0, 18, 0.12);
      border-color: rgba(230, 0, 18, 0.35);
      color: #ffb4b8;
    }

    .state {
      padding: 2rem;
      text-align: center;
      color: var(--muted);
      border: 1px dashed var(--line);
      border-radius: 12px;
    }

    .state--loading {
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
      gap: clamp(1rem, 2.5vw, 1.75rem);
    }

    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      border-radius: 14px;
      border: 1px solid var(--line);
      background: linear-gradient(165deg, var(--bg2) 0%, #0d0f16 100%);
      box-shadow: var(--shadow);
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .tile:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .tile-accent {
      height: 4px;
      background: linear-gradient(90deg, var(--accent) 0%, var(--gold) 100%);
    }

    .tile-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.25rem 0.75rem;
    }

    .tenant-name {
      margin: 0;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: 0.02em;
    }

    .tenant-slug {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
      color: var(--muted);
      font-family: ui-monospace, monospace;
    }

    .badge {
      flex-shrink: 0;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--gold);
      border: 1px solid rgba(201, 162, 39, 0.35);
      background: rgba(201, 162, 39, 0.08);
    }

    .section-label {
      margin: 0 1.25rem 0.65rem;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .chip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
      padding: 0 1.25rem 1rem;
      flex: 1;
    }

    .chip {
      position: relative;
      display: block;
      cursor: pointer;
      user-select: none;
      border-radius: 8px;
      overflow: hidden;
    }

    .chip-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .chip-glow {
      position: absolute;
      inset: 0;
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
      background: radial-gradient(circle at 50% 50%, rgba(230, 0, 18, 0.35), transparent 70%);
      pointer-events: none;
    }

    .chip:hover .chip-glow {
      opacity: 0.5;
    }

    .chip-body {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.65rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: var(--chip-off);
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .chip--on .chip-body {
      background: var(--chip-on);
      border-color: rgba(230, 0, 18, 0.45);
    }

    .chip-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      flex-shrink: 0;
    }

    .chip-dot--on {
      background: var(--accent);
      box-shadow: 0 0 10px rgba(230, 0, 18, 0.8);
    }

    .chip-label {
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .inline-error {
      margin: 0 1.25rem 0.75rem;
      font-size: 0.8rem;
      color: #ff8a90;
    }

    .tile-actions {
      padding: 0 1.25rem 1.25rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(180deg, #ff1a2e 0%, var(--accent-dim) 100%);
      box-shadow: 0 6px 24px rgba(230, 0, 18, 0.25);
      transition: transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
    }

    .btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `,
})
export class TenantsPageComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

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

  logout(): void {
    clearPlatformToken();
    void this.router.navigateByUrl('/login');
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
