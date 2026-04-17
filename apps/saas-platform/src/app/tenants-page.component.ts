import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { clearPlatformToken } from './platform-auth.interceptor';

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
  imports: [CommonModule, FormsModule],
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
              <label [attr.for]="'mods-' + t.id">Módulos (JSON array de ids)</label>
              <textarea
                [id]="'mods-' + t.id"
                rows="4"
                [ngModel]="draft()[t.id]"
                (ngModelChange)="patchDraft(t.id, $event)"
              ></textarea>
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
    label {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      margin-bottom: 0.35rem;
    }
    textarea {
      width: 100%;
      font-family: ui-monospace, monospace;
      font-size: 0.8rem;
      padding: 0.5rem 0.6rem;
      border-radius: 0.5rem;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
      resize: vertical;
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

  readonly tenants = signal<TenantRow[]>([]);
  readonly draft = signal<Record<string, string>>({});
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal<Record<string, boolean>>({});
  readonly saveError = signal<Record<string, string | undefined>>({});

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.http.get<TenantRow[]>('/api/platform/tenants').subscribe({
      next: (rows) => {
        this.tenants.set(rows);
        const d: Record<string, string> = {};
        for (const t of rows) {
          d[t.id] = JSON.stringify(t.enabledModuleIds ?? [], null, 2);
        }
        this.draft.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar la lista (¿sesión válida?).');
        this.loading.set(false);
      },
    });
  }

  patchDraft(id: string, value: string): void {
    this.draft.update((m) => ({ ...m, [id]: value }));
  }

  save(tenantId: string): void {
    const raw = this.draft()[tenantId];
    let ids: string[];
    try {
      ids = JSON.parse(raw) as string[];
      if (!Array.isArray(ids) || !ids.every((x) => typeof x === 'string')) {
        throw new Error('invalid');
      }
    } catch {
      this.saveError.update((m) => ({
        ...m,
        [tenantId]: 'JSON inválido: debe ser un array de strings.',
      }));
      return;
    }
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
          this.draft.update((m) => ({
            ...m,
            [tenantId]: JSON.stringify(r.enabledModuleIds, null, 2),
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
