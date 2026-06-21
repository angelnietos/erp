import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import {
  PERMISSIONS_CATALOG,
  PLATFORM_PERMISSIONS_CATALOG,
  TENANT_MODULE_LABELS_ES,
  type PermissionCatalogEntry,
  type PlatformPermissionEntry,
} from '@josanz-erp/identity-api';

type PermissionsPolicyResponse = {
  authorizationModel: Record<string, string>;
  erpPermissions: readonly PermissionCatalogEntry[];
  platformPermissions: readonly PlatformPermissionEntry[];
  permissionsByModule: Record<string, readonly string[]>;
  keycloakTenants: Array<{ slug: string; realm: string; clientId: string }>;
};

@Component({
  standalone: true,
  selector: 'app-permissions-policy-page',
  imports: [CommonModule],
  template: `
    <div class="shell">
      <header class="page-head">
        <p class="eyebrow">Modelo de autorización</p>
        <h1 class="title">Permisos unificados</h1>
        <p class="lede">
          Misma matriz de permisos ERP con login local o Keycloak. Keycloak autentica;
          Postgres (roles + módulos contratados) autoriza.
        </p>
      </header>

      @if (loading()) {
        <div class="state">Cargando política…</div>
      } @else if (error()) {
        <div class="banner banner--error">{{ error() }}</div>
      } @else if (policy()) {
        <section class="card">
          <h2>Capas</h2>
          <dl class="model-grid">
            @for (item of modelEntries(); track item.key) {
              <div class="model-row">
                <dt>{{ item.key }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            }
          </dl>
        </section>

        <section class="card">
          <h2>Tenants con Keycloak</h2>
          <ul class="kc-list">
            @for (t of policy()!.keycloakTenants; track t.slug) {
              <li>
                <strong>{{ t.slug }}</strong>
                <span>{{ t.realm }} · {{ t.clientId }}</span>
              </li>
            }
          </ul>
          <p class="hint">
            Slugs sin entrada aquí usan solo login local (p. ej. docs).
          </p>
        </section>

        <section class="card">
          <h2>Permisos del panel SaaS</h2>
          <ul class="perm-list">
            @for (p of policy()!.platformPermissions; track p.id) {
              <li><code>{{ p.id }}</code> — {{ p.label }}</li>
            }
          </ul>
        </section>

        <section class="card">
          <h2>Módulos → permisos ERP</h2>
          <div class="module-perm-grid">
            @for (entry of modulePermissionRows(); track entry.moduleId) {
              <article class="module-perm">
                <h3>{{ entry.label }}</h3>
                <ul>
                  @for (perm of entry.permissions; track perm) {
                    <li><code>{{ perm }}</code></li>
                  }
                </ul>
              </article>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: var(--sp-font-sans);
        color: var(--sp-text);
      }
      .shell {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 clamp(1rem, 3.5vw, 2rem) 3rem;
      }
      .page-head {
        margin-bottom: 1.5rem;
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
        margin: 0 0 0.5rem;
        font-family: var(--sp-font-display);
        font-size: clamp(1.75rem, 4vw, 2.5rem);
      }
      .lede {
        margin: 0;
        max-width: 42rem;
        color: var(--sp-muted);
        line-height: 1.55;
      }
      .card {
        margin-bottom: 1.25rem;
        padding: 1.25rem;
        border: 1px solid var(--sp-line);
        border-radius: var(--sp-radius-md);
        background: linear-gradient(165deg, rgba(18, 21, 30, 0.55), rgba(8, 9, 14, 0.35));
      }
      .card h2 {
        margin: 0 0 1rem;
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--sp-muted);
      }
      .model-grid {
        margin: 0;
        display: grid;
        gap: 0.65rem;
      }
      .model-row {
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 0.75rem;
        font-size: 0.88rem;
      }
      .model-row dt {
        font-weight: 700;
        color: var(--sp-gold);
      }
      .model-row dd {
        margin: 0;
        color: var(--sp-text);
      }
      .kc-list,
      .perm-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.5rem;
      }
      .kc-list li {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        font-size: 0.88rem;
      }
      .kc-list span {
        color: var(--sp-muted);
        font-family: ui-monospace, monospace;
        font-size: 0.8rem;
      }
      .hint {
        margin: 0.75rem 0 0;
        font-size: 0.82rem;
        color: var(--sp-muted);
      }
      .module-perm-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 0.85rem;
      }
      .module-perm {
        padding: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--sp-radius-sm);
        background: rgba(0, 0, 0, 0.2);
      }
      .module-perm h3 {
        margin: 0 0 0.5rem;
        font-size: 0.9rem;
      }
      .module-perm ul {
        margin: 0;
        padding-left: 1rem;
        font-size: 0.78rem;
        color: var(--sp-muted);
      }
      code {
        font-family: ui-monospace, monospace;
        font-size: 0.78rem;
      }
      .state,
      .banner {
        padding: 1rem;
        border-radius: var(--sp-radius-sm);
      }
      .banner--error {
        background: rgba(230, 0, 18, 0.1);
        border: 1px solid rgba(230, 0, 18, 0.35);
        color: #ffb1b6;
      }
    `,
  ],
})
export class PermissionsPolicyPageComponent {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiOrigin.replace(/\/$/, '');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly policy = signal<PermissionsPolicyResponse | null>(null);

  readonly modelEntries = computed(() => {
    const model = this.policy()?.authorizationModel ?? {};
    return Object.entries(model).map(([key, value]) => ({ key, value }));
  });

  readonly modulePermissionRows = computed(() => {
    const byModule = this.policy()?.permissionsByModule ?? {};
    return Object.entries(byModule)
      .filter(([id]) => id !== '_global')
      .map(([moduleId, permissions]) => ({
        moduleId,
        label: TENANT_MODULE_LABELS_ES[moduleId] ?? moduleId,
        permissions,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<PermissionsPolicyResponse>(
          `${this.apiBase}/api/platform/tenants/permissions-policy`,
        ),
      );
      this.policy.set(data);
    } catch {
      this.policy.set({
        authorizationModel: {
          tenantModules: 'Postgres',
          erpPermissions: 'Postgres + filtro módulos',
          keycloakRole: 'IdP opcional',
          platformPermissions: 'JWT unificado',
        },
        erpPermissions: PERMISSIONS_CATALOG,
        platformPermissions: PLATFORM_PERMISSIONS_CATALOG,
        permissionsByModule: {},
        keycloakTenants: [],
      });
      this.error.set(
        'No se pudo cargar desde el backend; mostrando catálogo embebido.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
