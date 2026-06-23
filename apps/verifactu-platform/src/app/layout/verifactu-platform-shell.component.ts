import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { SessionTokenStorageService } from '@generic-crm/shared-browser-data-access';
import { IdentityAuthService } from '@generic-crm/identity-data-access';
import { environment } from '../../environments/environment';
import {
  clearVerifactuPkceRedirectPending,
  clearVerifactuPkceSession,
} from '../auth/pkce.util';
import { VerifactuKeycloakAuthService } from '../auth/verifactu-keycloak-auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-verifactu-platform-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="vf-shell">
      <aside class="vf-sidebar" aria-label="Navegación Verifactu">
        <div class="vf-brand">
          <span class="vf-brand__mark" aria-hidden="true">VF</span>
          <div>
            <p class="vf-brand__title">Verifactu</p>
            <p class="vf-brand__sub">Facturación AEAT</p>
          </div>
        </div>

        <nav class="vf-nav">
          @for (item of mainNav; track item.route) {
            <a
              class="vf-nav__link"
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            >
              <lucide-icon [name]="item.icon" size="18" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="vf-sidebar__footer">
          <a class="vf-nav__link" routerLink="/clients" routerLinkActive="is-active">
            <lucide-icon name="users" size="18" aria-hidden="true" />
            <span>Clientes</span>
          </a>
          @if (erpHubUrl) {
            <a class="vf-nav__link vf-nav__link--muted" [href]="erpHubUrl" target="_blank" rel="noopener">
              <lucide-icon name="external-link" size="16" aria-hidden="true" />
              <span>Babooni Hub</span>
            </a>
          }
          <button type="button" class="vf-nav__link vf-nav__link--btn" (click)="logout()">
            <lucide-icon name="log-out" size="18" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div class="vf-main">
        <header class="vf-topbar">
          <div>
            <p class="vf-topbar__eyebrow">Tenant activo</p>
            <p class="vf-topbar__tenant">{{ tenantName() }}</p>
            <p class="vf-topbar__meta">
              <span class="vf-topbar__slug">{{ tenantSlug() }}</span>
              @if (userEmail()) {
                <span class="vf-topbar__sep">·</span>
                <span>{{ userEmail() }}</span>
              }
            </p>
          </div>
          <div class="vf-topbar__badge">
            <span class="vf-pulse" aria-hidden="true"></span>
            Cola ERP · Worker único
          </div>
        </header>
        <main id="app-main" class="vf-content" tabindex="-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }
      .vf-shell {
        display: grid;
        grid-template-columns: 15.5rem 1fr;
        min-height: 100dvh;
      }
      .vf-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem 0.85rem;
        background: linear-gradient(180deg, #0b1220 0%, #0f172a 55%, #14532d 140%);
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--vf-text-on-dark, #e2e8f0);
      }
      .vf-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.35rem 0.5rem 0.85rem;
      }
      .vf-brand__mark {
        display: grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.65rem;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #052e16;
        background: linear-gradient(135deg, #4ade80, #16a34a);
        box-shadow: 0 0 24px var(--vf-accent-glow);
      }
      .vf-brand__title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .vf-brand__sub {
        margin: 0.1rem 0 0;
        font-size: 0.68rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--vf-text-on-dark-muted);
      }
      .vf-nav {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        flex: 1;
      }
      .vf-nav__link {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.55rem 0.65rem;
        border-radius: 0.55rem;
        color: var(--vf-text-on-dark-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
      }
      .vf-nav__link:hover {
        background: var(--vf-sidebar-hover);
        color: var(--vf-text-on-dark);
      }
      .vf-nav__link.is-active {
        background: var(--vf-sidebar-active);
        color: #bbf7d0;
        box-shadow: inset 3px 0 0 var(--vf-accent-light);
      }
      .vf-nav__link--muted {
        opacity: 0.85;
      }
      .vf-nav__link--btn {
        color: #fca5a5;
      }
      .vf-sidebar__footer {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .vf-main {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
      }
      .vf-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem 1.5rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--vf-border);
        background: var(--vf-bg-elevated);
      }
      .vf-topbar__eyebrow {
        margin: 0;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--vf-text-muted);
      }
      .vf-topbar__tenant {
        margin: 0.15rem 0 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .vf-topbar__meta {
        margin: 0.2rem 0 0;
        font-size: 0.78rem;
        color: var(--vf-text-muted);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
      }
      .vf-topbar__slug {
        display: inline-flex;
        padding: 0.12rem 0.45rem;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #166534;
        background: var(--vf-accent-soft);
        border: 1px solid rgba(34, 197, 94, 0.22);
      }
      .vf-topbar__sep {
        opacity: 0.45;
      }
      .vf-topbar__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #166534;
        background: var(--vf-accent-soft);
        border: 1px solid rgba(34, 197, 94, 0.25);
      }
      .vf-pulse {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 50%;
        background: var(--vf-accent-light);
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
        animation: vf-pulse 2s ease-out infinite;
      }
      @keyframes vf-pulse {
        70% {
          box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
        }
      }
      .vf-content {
        flex: 1;
        padding: 1.25rem 1.5rem 2rem;
        min-width: 0;
      }
      @media (max-width: 900px) {
        .vf-shell {
          grid-template-columns: 1fr;
        }
        .vf-sidebar {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
        }
        .vf-nav {
          flex-direction: row;
          flex-wrap: wrap;
          flex: unset;
        }
        .vf-sidebar__footer {
          flex-direction: row;
          flex-wrap: wrap;
          border-top: none;
          padding-top: 0;
        }
      }
    `,
  ],
})
export class VerifactuPlatformShellComponent implements OnInit {
  readonly mainNav: NavItem[] = [
    { label: 'Resumen', route: '/verifactu/overview', icon: 'layout-dashboard' },
    { label: 'Cola AEAT', route: '/verifactu/queue', icon: 'list-ordered' },
    { label: 'Series', route: '/verifactu/series', icon: 'hash' },
    { label: 'Historial', route: '/verifactu/logs', icon: 'history' },
    { label: 'Certificado', route: '/verifactu/credentials', icon: 'shield' },
    { label: 'Integración', route: '/verifactu/integration', icon: 'plug' },
  ];

  readonly erpHubUrl = environment.erpHubUrl;
  private readonly session = inject(SessionTokenStorageService);
  private readonly auth = inject(IdentityAuthService);
  private readonly keycloak = inject(VerifactuKeycloakAuthService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly tenantSlug = computed(
    () => this.session.tenantSlug() || environment.defaultTenantSlug || 'demo',
  );

  readonly tenantName = computed(
    () => this.session.tenantName() || this.tenantSlug(),
  );

  readonly userEmail = signal<string | null>(null);

  ngOnInit(): void {
    this.refreshSessionContext();
  }

  private refreshSessionContext(): void {
    if (!this.session.getAccessToken()) {
      return;
    }
    this.auth.session().subscribe({
      next: (res) => {
        if (res.tenantSlug && res.tenantName) {
          this.session.setTenantContext({
            tenantId: res.tenantId,
            tenantSlug: res.tenantSlug,
            tenantName: res.tenantName,
          });
        }
        this.userEmail.set(res.user.email);
      },
      error: () => {
        /* ignore — topbar uses stored tenant context */
      },
    });
  }

  logout(): void {
    const tenantSlug =
      this.session.getTenantSlug()?.trim() ||
      environment.defaultTenantSlug;
    this.auth.logout();
    clearVerifactuPkceSession();
    clearVerifactuPkceRedirectPending();
    if (this.keycloak.canUseKeycloak(tenantSlug)) {
      this.keycloak.endSessionLogout(tenantSlug);
      return;
    }
    void this.router.navigate(['/login'], {
      queryParams: { reason: 'logout', tenant: tenantSlug },
      replaceUrl: true,
    });
  }
}
