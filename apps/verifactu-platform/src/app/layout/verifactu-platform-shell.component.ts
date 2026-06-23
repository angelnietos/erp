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
import {
  normalizeTenantSlug,
  resolveTenantDisplayName,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
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
        position: sticky;
        top: 0;
        align-self: start;
        display: flex;
        flex-direction: column;
        gap: 0;
        height: 100dvh;
        max-height: 100dvh;
        overflow: hidden;
        padding: 1.35rem 0.9rem 1rem;
        background:
          radial-gradient(420px 280px at 0% 0%, rgba(16, 217, 129, 0.12), transparent 60%),
          radial-gradient(360px 240px at 100% 100%, rgba(14, 165, 233, 0.08), transparent 55%),
          linear-gradient(185deg, var(--vf-sidebar, #0a0f1c) 0%, var(--vf-sidebar-mid, #111827) 52%, var(--vf-sidebar-deep, #0d2818) 130%);
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--vf-text-on-dark, #eef2f8);
        box-shadow: 4px 0 32px rgb(0 0 0 / 0.12);
      }
      .vf-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.35rem 0.5rem 0.85rem;
        flex-shrink: 0;
      }
      .vf-brand__mark {
        display: grid;
        place-items: center;
        width: 2.65rem;
        height: 2.65rem;
        border-radius: 0.85rem;
        font-family: var(--vf-font-display, inherit);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #042f1a;
        background: var(--vf-accent-gradient, linear-gradient(135deg, #34f5a8, #0d9f5f));
        box-shadow:
          0 0 28px var(--vf-accent-glow),
          0 4px 12px rgb(0 0 0 / 0.25),
          inset 0 1px 0 rgb(255 255 255 / 0.35);
      }
      .vf-brand__title {
        margin: 0;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.1rem;
        font-weight: 800;
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
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0.25rem 0;
        margin: 0 -0.15rem;
        scrollbar-width: thin;
      }
      .vf-nav__link {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.7rem;
        border-radius: var(--vf-radius-sm, 0.625rem);
        color: var(--vf-text-on-dark-muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        box-sizing: border-box;
        transition:
          background var(--vf-duration, 0.2s) var(--vf-ease, ease),
          color var(--vf-duration, 0.2s) var(--vf-ease, ease),
          border-color var(--vf-duration, 0.2s) var(--vf-ease, ease);
      }
      .vf-nav__link:hover {
        background: var(--vf-sidebar-hover);
        color: var(--vf-text-on-dark);
      }
      .vf-nav__link.is-active {
        background: var(--vf-sidebar-active);
        color: #a7f3d0;
        border-color: rgba(16, 217, 129, 0.2);
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
        flex-shrink: 0;
        padding-top: 0.75rem;
        margin-top: 0.5rem;
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
        background: rgb(255 255 255 / 0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 1px 0 rgb(255 255 255 / 0.6) inset;
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
        font-family: var(--vf-font-display, inherit);
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: -0.02em;
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
        padding: 0.15rem 0.55rem;
        border-radius: var(--vf-radius-pill, 999px);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #047857;
        background: var(--vf-accent-soft);
        border: 1px solid rgba(16, 217, 129, 0.25);
      }
      .vf-topbar__sep {
        opacity: 0.45;
      }
      .vf-topbar__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.85rem;
        border-radius: var(--vf-radius-pill, 999px);
        font-size: 0.78rem;
        font-weight: 700;
        color: #047857;
        background: var(--vf-accent-soft);
        border: 1px solid rgba(16, 217, 129, 0.28);
        box-shadow: var(--vf-shadow-sm);
      }
      .vf-pulse {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--vf-accent-light);
        box-shadow: 0 0 0 0 rgba(16, 217, 129, 0.55);
        animation: vf-pulse 2.2s ease-out infinite;
      }
      @keyframes vf-pulse {
        70% {
          box-shadow: 0 0 0 10px rgba(16, 217, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 217, 129, 0);
        }
      }
      .vf-content {
        flex: 1;
        padding: 1.35rem 1.5rem 2.25rem;
        min-width: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .vf-nav__link {
          transition: none;
        }
      }
      @media (max-width: 900px) {
        .vf-shell {
          grid-template-columns: 1fr;
        }
        .vf-sidebar {
          position: relative;
          height: auto;
          max-height: none;
          overflow: visible;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
        }
        .vf-nav {
          flex-direction: row;
          flex-wrap: wrap;
          flex: unset;
          overflow: visible;
        }
        .vf-sidebar__footer {
          flex-direction: row;
          flex-wrap: wrap;
          border-top: none;
          padding-top: 0;
          margin-top: 0;
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
    () =>
      normalizeTenantSlug(this.session.tenantSlug()) ??
      environment.defaultTenantSlug ??
      'demo',
  );

  readonly tenantName = computed(() =>
    resolveTenantDisplayName(this.tenantSlug(), this.session.tenantName()),
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
        if (res.tenantId && res.tenantSlug && res.tenantName) {
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
