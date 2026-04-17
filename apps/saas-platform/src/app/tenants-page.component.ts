import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  DEFAULT_TENANT_MODULE_IDS,
  normalizeTenantModuleIds,
  TENANT_MODULE_LABELS_ES,
} from '@josanz-erp/identity-api';
import { clearPlatformToken, setPlatformToken } from './platform-auth.interceptor';

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  enabledModuleIds: string[];
}

@Component({
  standalone: true,
  selector: 'app-tenants-page',
  imports: [CommonModule],
  template: `
    <div class="shell">
      <header class="top">
        <div>
          <h1>Tenants</h1>
          <p class="sub">Módulos activos por organización (ERP cliente)</p>
        </div>
        <button type="button" class="ghost" (click)="logout()">Salir</button>
      </header>

      @if (loadError()) {
        <p class="err">{{ loadError() }}</p>
      }

      @if (loading()) {
        <p>Cargando…</p>
      } @else {
        <div class="grid">
          @for (t of tenants(); track t.id) {
            <article class="card">
              <div class="card-head">
                <h2>{{ t.name }}</h2>
                <span class="slug">{{ t.slug }}</span>
              </div>
              <p class="mods-title">Módulos contratados</p>
              <ul class="mod-list">
                @for (mid of moduleIds; track mid) {
                  <li>
                    <label class="mod-row">
                      <input
                        type="checkbox"
                        [checked]="isOn(t.id, mid)"
                        [disabled]="mid === 'dashboard'"
                        (change)="toggle(t.id, mid)"
                      />
                      <span>{{ label(mid) }}</span>
                    </label>
                  </li>
                }
              </ul>
              @if (saveError()[t.id]) {
                <p class="err small">{{ saveError()[t.id] }}</p>
              }
              <button
                type="button"
                [disabled]="saving()[t.id]"
                (click)="save(t.id)"
              >
                {{ saving()[t.id] ? 'Guardando…' : 'Guardar módulos' }}
              </button>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .shell {
      min-height: 100vh;
      padding: 2rem clamp(1rem, 4vw, 3rem);
      background: #020617;
      color: #e2e8f0;
      font-family: system-ui, sans-serif;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .sub {
      margin: 0.35rem 0 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .ghost {
      background: transparent;
      border: 1px solid #475569;
      color: #e2e8f0;
      padding: 0.45rem 0.9rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .grid {
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
    .card {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1rem;
      padding: 1.25rem;
    }
    .card-head {
      margin-bottom: 0.75rem;
    }
    h2 {
      margin: 0;
      font-size: 1.1rem;
    }
    .slug {
      font-size: 0.8rem;
      color: #64748b;
    }
    .mods-title {
      margin: 0 0 0.5rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }
    .mod-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 280px;
      overflow-y: auto;
    }
    .mod-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.88rem;
      padding: 0.25rem 0;
    }
    .mod-row input[disabled] + span {
      opacity: 0.7;
    }
    button[type='button'] {
      margin-top: 0.75rem;
      width: 100%;
      padding: 0.55rem;
      border: none;
      border-radius: 0.5rem;
      background: #b91c1c;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .err {
      color: #fca5a5;
    }
    .err.small {
      font-size: 0.8rem;
      margin: 0.35rem 0;
    }
  `,
})
export class TenantsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly moduleIds = [...DEFAULT_TENANT_MODULE_IDS];
  readonly tenants = signal<TenantRow[]>([]);
  /** Módulos activos por tenant (ids normalizados). */
  readonly selected = signal<Record<string, string[]>>({});
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal<Record<string, boolean>>({});
  readonly saveError = signal<Record<string, string | undefined>>({});

  label(id: string): string {
    return TENANT_MODULE_LABELS_ES[id] ?? id;
  }

  isOn(tenantId: string, moduleId: string): boolean {
    return (this.selected()[tenantId] ?? []).includes(moduleId);
  }

  toggle(tenantId: string, moduleId: string): void {
    if (moduleId === 'dashboard') {
      return;
    }
    this.selected.update((m) => {
      const prev = m[tenantId] ?? ['dashboard'];
      const set = new Set(prev);
      if (set.has(moduleId)) {
        set.delete(moduleId);
      } else {
        set.add(moduleId);
      }
      if (!set.has('dashboard')) {
        set.add('dashboard');
      }
      return { ...m, [tenantId]: normalizeTenantModuleIds([...set]) };
    });
  }

  ngOnInit(): void {
    this.http
      .get<{ accessToken: string }>('/api/platform/auth/session')
      .subscribe({
        next: (r) => {
          if (r.accessToken) {
            setPlatformToken(r.accessToken);
          }
          this.loadTenants();
        },
        error: () => this.loadTenants(),
      });
  }

  private loadTenants(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.http.get<TenantRow[]>('/api/platform/tenants').subscribe({
      next: (rows) => {
        this.tenants.set(rows);
        const sel: Record<string, string[]> = {};
        for (const t of rows) {
          sel[t.id] = normalizeTenantModuleIds(t.enabledModuleIds ?? []);
        }
        this.selected.set(sel);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar la lista (¿sesión válida?).');
        this.loading.set(false);
      },
    });
  }

  save(tenantId: string): void {
    const ids = normalizeTenantModuleIds(this.selected()[tenantId] ?? []);
    this.saveError.update((m) => ({ ...m, [tenantId]: undefined }));
    this.saving.update((m) => ({ ...m, [tenantId]: true }));
    this.http
      .put<{ enabledModuleIds: string[] }>(
        `/api/platform/tenants/${tenantId}/modules`,
        { enabledModuleIds: ids },
      )
      .subscribe({
        next: (r) => {
          this.tenants.update((list) =>
            list.map((t) =>
              t.id === tenantId ? { ...t, enabledModuleIds: r.enabledModuleIds } : t,
            ),
          );
          this.selected.update((m) => ({
            ...m,
            [tenantId]: normalizeTenantModuleIds(r.enabledModuleIds),
          }));
          this.saving.update((m) => ({ ...m, [tenantId]: false }));
        },
        error: (e: { error?: { message?: string } }) => {
          this.saving.update((m) => ({ ...m, [tenantId]: false }));
          this.saveError.update((m) => ({
            ...m,
            [tenantId]:
              e?.error?.message ?? 'Error al guardar (revisa permisos y módulos).',
          }));
        },
      });
  }

  logout(): void {
    clearPlatformToken();
    void this.router.navigateByUrl('/login');
  }
}
