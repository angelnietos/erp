import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {
  TENANT_MODULE_CATALOG_SAAS,
  TENANT_MODULE_CATEGORY_LABELS_ES,
  type TenantModuleCatalogEntry,
  type TenantModuleCategory,
} from './tenant-module-catalog';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  enabledModuleIds: string[];
  authMode?: 'keycloak' | 'local';
  keycloakRealm?: string;
  keycloakClientId?: string;
  authorizationSource?: 'postgres';
};

type ModuleCategoryGroup = {
  id: TenantModuleCategory;
  label: string;
  modules: readonly TenantModuleCatalogEntry[];
};

@Component({
  standalone: true,
  selector: 'app-tenants-page',
  imports: [CommonModule, FormsModule, RouterLink],
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
      @if (success()) {
        <div class="banner banner--success" role="status">
          <span class="banner-icon banner-icon--success" aria-hidden="true">✓</span>
          {{ success() }}
        </div>
      }

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
        <div class="toolbar">
          <label class="search-field">
            <span>Buscar tenant</span>
            <input
              type="search"
              [ngModel]="tenantSearch()"
              (ngModelChange)="tenantSearch.set($event)"
              placeholder="Nombre o slug"
            />
          </label>
          <div class="toolbar-count">
            {{ filteredTenants().length }} de {{ tenants().length }} tenants
          </div>
        </div>

        @if (filteredTenants().length === 0) {
          <div class="state state--empty" role="status">
            <p class="state-empty-title">Sin resultados</p>
            <p class="state-empty-lede">
              No hay tenants que coincidan con la búsqueda actual.
            </p>
          </div>
        } @else {
        <div class="grid">
          @for (t of filteredTenants(); track t.id) {
            <article class="tile">
              <div class="tile-accent"></div>
              <div class="tile-head">
                <div>
                  <h2 class="tenant-name">{{ t.name }}</h2>
                  <p class="tenant-slug">{{ t.slug }}</p>
                  <p class="tenant-auth">
                    @if (t.authMode === 'keycloak') {
                      <span class="auth-badge auth-badge--kc">Keycloak</span>
                      <span class="auth-detail">{{ t.keycloakRealm }}</span>
                    } @else {
                      <span class="auth-badge auth-badge--local">Local</span>
                    }
                    <span class="auth-detail">Permisos → Postgres</span>
                  </p>
                </div>
                <span class="badge">{{ countEnabled(t) }} / {{ catalog.length }}</span>
              </div>

              <p class="section-label">Módulos contratados</p>
              <div class="module-groups" role="group" [attr.aria-label]="'Módulos para ' + t.name">
                @for (group of catalogByCategory(); track group.id) {
                  <section class="module-group">
                    <div class="module-group-head">
                      <span>{{ group.label }}</span>
                      <span>{{ countEnabledInGroup(t, group.modules) }} / {{ group.modules.length }}</span>
                    </div>
                    <div class="chip-grid">
                      @for (m of group.modules; track m.id) {
                        <label class="chip" [class.chip--on]="isOn(t, m.id)">
                          <input
                            type="checkbox"
                            class="chip-input"
                            [ngModel]="isOn(t, m.id)"
                            (ngModelChange)="toggle(t, m.id, $event)"
                          />
                          <span class="chip-glow"></span>
                          <span class="chip-body">
                            <span class="chip-icon" aria-hidden="true">{{ moduleIcon(m.icon) }}</span>
                            <span class="chip-label">{{ m.label }}</span>
                          </span>
                        </label>
                      }
                    </div>
                  </section>
                }
              </div>

              @if (hasPendingChanges(t)) {
                <div class="pending-diff">
                  <p>Cambios pendientes</p>
                  @if (addedModules(t).length) {
                    <span class="diff-pill diff-pill--add">+ {{ addedModules(t).join(', ') }}</span>
                  }
                  @if (removedModules(t).length) {
                    <span class="diff-pill diff-pill--remove">- {{ removedModules(t).join(', ') }}</span>
                  }
                </div>
              }

              @if (saveErrorByTenant()[t.id]) {
                <p class="inline-error">{{ saveErrorByTenant()[t.id] }}</p>
              }

              <div class="tile-actions">
                <a [routerLink]="['/tenants', t.id]" class="btn-secondary">Roles y usuarios</a>
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="savingByTenant()[t.id] || !hasPendingChanges(t)"
                  (click)="save(t)"
                >
                  {{ savingByTenant()[t.id] ? 'Guardando…' : 'Guardar módulos' }}
                </button>
              </div>
            </article>
          }
        </div>
        }
      }
      </div>
    </div>
  `,
  styles: [
    `
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

      .banner--success {
        background: rgba(78, 202, 114, 0.1);
        border-color: rgba(78, 202, 114, 0.35);
        color: #b8f3c7;
      }

      .banner-icon--success {
        background: rgba(78, 202, 114, 0.35);
      }

      .toolbar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.2rem;
        padding: 1rem;
        border: 1px solid var(--sp-line);
        border-radius: var(--sp-radius-md);
        background: linear-gradient(165deg, rgba(18, 21, 30, 0.55), rgba(8, 9, 14, 0.35));
      }

      .search-field {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        width: min(100%, 360px);
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--sp-muted);
      }

      .search-field input {
        width: 100%;
        padding: 0.72rem 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.11);
        border-radius: var(--sp-radius-sm);
        background: rgba(0, 0, 0, 0.26);
        color: var(--sp-text);
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
      }

      .search-field input:focus {
        border-color: rgba(89, 168, 244, 0.65);
        box-shadow: var(--sp-focus);
      }

      .toolbar-count {
        color: var(--sp-muted);
        font-size: 0.82rem;
        font-weight: 600;
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

      .tenant-auth {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.4rem 0.55rem;
        margin: 0.55rem 0 0;
        font-size: 0.72rem;
      }

      .auth-badge {
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .auth-badge--kc {
        background: rgba(89, 168, 244, 0.18);
        color: #9fd0ff;
        border: 1px solid rgba(89, 168, 244, 0.35);
      }

      .auth-badge--local {
        background: rgba(78, 202, 114, 0.12);
        color: #b8f3c7;
        border: 1px solid rgba(78, 202, 114, 0.3);
      }

      .auth-detail {
        color: var(--sp-muted);
        font-family: ui-monospace, monospace;
        font-size: 0.68rem;
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

      .module-groups {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 0 1.3rem 1.05rem;
        flex: 1;
      }

      .module-group {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }

      .module-group-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: rgba(232, 234, 239, 0.72);
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .chip-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.55rem;
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

      .chip-icon {
        width: 1.35rem;
        height: 1.35rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 8px;
        color: rgba(232, 234, 239, 0.86);
        background: rgba(255, 255, 255, 0.08);
        font-size: 0.82rem;
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

      .pending-diff {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        margin: 0 1.3rem 0.9rem;
        padding: 0.72rem 0.82rem;
        border: 1px dashed rgba(201, 162, 39, 0.38);
        border-radius: var(--sp-radius-sm);
        background: rgba(201, 162, 39, 0.08);
      }

      .pending-diff p {
        margin: 0;
        color: var(--sp-gold);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .diff-pill {
        display: block;
        font-size: 0.78rem;
        line-height: 1.45;
      }

      .diff-pill--add {
        color: #9be7b0;
      }

      .diff-pill--remove {
        color: #ffb1b6;
      }

      .tile-actions {
        padding: 0 1.3rem 1.3rem;
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
      }

      .btn-secondary {
        display: block;
        width: 100%;
        padding: 0.65rem 1rem;
        border-radius: var(--sp-radius-sm);
        border: 1px solid rgba(89, 168, 244, 0.45);
        background: rgba(0, 75, 147, 0.15);
        color: #cfe8ff;
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 600;
        text-align: center;
        text-decoration: none;
        letter-spacing: 0.04em;
      }

      .btn-secondary:hover {
        background: rgba(0, 75, 147, 0.28);
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
  ],
})
export class TenantsPageComponent {
  private readonly http = inject(HttpClient);

  readonly apiBase = environment.apiOrigin.replace(/\/$/, '');
  readonly catalog: readonly TenantModuleCatalogEntry[] = TENANT_MODULE_CATALOG_SAAS;
  readonly catalogByCategory = computed<readonly ModuleCategoryGroup[]>(() => {
    const groups = new Map<TenantModuleCategory, TenantModuleCatalogEntry[]>();
    for (const module of this.catalog) {
      groups.set(module.category, [...(groups.get(module.category) ?? []), module]);
    }
    return Array.from(groups.entries()).map(([id, modules]) => ({
      id,
      label: TENANT_MODULE_CATEGORY_LABELS_ES[id],
      modules,
    }));
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly tenants = signal<TenantRow[]>([]);
  readonly tenantSearch = signal('');
  readonly filteredTenants = computed(() => {
    const query = this.tenantSearch().trim().toLowerCase();
    if (!query) {
      return this.tenants();
    }
    return this.tenants().filter((tenant) =>
      `${tenant.name} ${tenant.slug}`.toLowerCase().includes(query),
    );
  });

  readonly savingByTenant = signal<Record<string, boolean>>({});
  readonly saveErrorByTenant = signal<Record<string, string | undefined>>({});
  private readonly originalModuleIdsByTenant = signal<Record<string, string[]>>({});

  constructor() {
    void this.refresh();
  }

  countEnabled(t: TenantRow): number {
    return t.enabledModuleIds.length;
  }

  countEnabledInGroup(
    t: TenantRow,
    modules: readonly TenantModuleCatalogEntry[],
  ): number {
    return modules.filter((module) => this.isOn(t, module.id)).length;
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
    this.success.set(null);
  }

  hasPendingChanges(t: TenantRow): boolean {
    return this.addedModules(t).length > 0 || this.removedModules(t).length > 0;
  }

  addedModules(t: TenantRow): string[] {
    const original = new Set(this.originalModuleIdsByTenant()[t.id] ?? []);
    return t.enabledModuleIds
      .filter((id) => !original.has(id))
      .map((id) => this.moduleLabel(id));
  }

  removedModules(t: TenantRow): string[] {
    const current = new Set(t.enabledModuleIds);
    return (this.originalModuleIdsByTenant()[t.id] ?? [])
      .filter((id) => !current.has(id))
      .map((id) => this.moduleLabel(id));
  }

  moduleIcon(icon: string): string {
    const icons: Record<string, string> = {
      grid: 'G',
      users: 'U',
      briefcase: 'P',
      key: 'K',
      calendar: 'E',
      clock: 'T',
      wrench: 'S',
      box: 'I',
      truck: 'D',
      car: 'F',
      repeat: 'R',
      calculator: '#',
      receipt: '$',
      shield: 'V',
      sparkles: '*',
      chart: '^',
      history: 'A',
    };
    return icons[icon] ?? 'G';
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
      this.originalModuleIdsByTenant.set(this.snapshotRows(rows ?? []));
    } catch (e: unknown) {
      const msg = this.httpErrorMessage(e);
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async save(t: TenantRow): Promise<void> {
    if (!this.hasPendingChanges(t)) {
      return;
    }
    const summary = [
      ...this.addedModules(t).map((name) => `+ ${name}`),
      ...this.removedModules(t).map((name) => `- ${name}`),
    ];
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm(
        `Guardar cambios de módulos para ${t.name}?\n\n${summary.join('\n')}`,
      );
    if (!confirmed) {
      return;
    }

    this.savingByTenant.update((m) => ({ ...m, [t.id]: true }));
    this.saveErrorByTenant.update((m) => ({ ...m, [t.id]: undefined }));
    try {
      await firstValueFrom(
        this.http.put(`${this.apiBase}/api/platform/tenants/${t.id}/modules`, {
          enabledModuleIds: t.enabledModuleIds,
        }),
      );
      this.originalModuleIdsByTenant.update((m) => ({
        ...m,
        [t.id]: [...t.enabledModuleIds],
      }));
      this.success.set(`Módulos actualizados para ${t.name}.`);
    } catch (e: unknown) {
      const msg = this.httpErrorMessage(e);
      this.saveErrorByTenant.update((m) => ({ ...m, [t.id]: msg }));
    } finally {
      this.savingByTenant.update((m) => ({ ...m, [t.id]: false }));
    }
  }

  private snapshotRows(rows: TenantRow[]): Record<string, string[]> {
    return rows.reduce<Record<string, string[]>>((acc, row) => {
      acc[row.id] = [...row.enabledModuleIds];
      return acc;
    }, {});
  }

  private moduleLabel(moduleId: string): string {
    return this.catalog.find((module) => module.id === moduleId)?.label ?? moduleId;
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
