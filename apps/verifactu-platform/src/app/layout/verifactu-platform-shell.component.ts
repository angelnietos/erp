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
import { GcrmToastStackComponent } from '@generic-crm/shared-ui';
import { VerifactuKeycloakAuthService } from '../auth/verifactu-keycloak-auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-verifactu-platform-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, GcrmToastStackComponent],
  template: `
    <div class="vf-shell" [class.vf-theme-dark]="isDarkTheme()">
      <aside class="vf-sidebar" aria-label="Navegación Verifactu">
        <div class="vf-brand">
          <div class="vf-brand__mark" aria-hidden="true">VF</div>
          <div class="vf-brand__text">
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
          <div class="vf-theme-selector" (click)="toggleThemeMenu()" (keydown.enter)="toggleThemeMenu()" tabindex="0">
            <button type="button" class="vf-theme-btn" [attr.aria-label]="isDarkTheme() ? 'Tema oscuro activo' : 'Tema claro activo'">
              <lucide-icon [name]="isDarkTheme() ? 'moon' : 'sun'" size="16" aria-hidden="true" />
              <span>Tema</span>
            </button>
            @if (showThemeMenu()) {
              <div class="vf-theme-menu" role="listbox" aria-label="Seleccionar tema">
                <button type="button" class="vf-theme-option" [class.is-active]="currentTheme() === 'light'" (click)="setTheme('light')">
                  <lucide-icon name="sun" size="14" aria-hidden="true" />
                  <span>Claro</span>
                </button>
                <button type="button" class="vf-theme-option" [class.is-active]="currentTheme() === 'dark'" (click)="setTheme('dark')">
                  <lucide-icon name="moon" size="14" aria-hidden="true" />
                  <span>Oscuro</span>
                </button>
              </div>
            }
          </div>
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
      <gcrm-toast-stack />
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
        grid-template-columns: 16rem 1fr;
        min-height: 100dvh;
        transition: var(--vf-transition-colors);
      }
      .vf-shell.vf-theme-dark {
        --vf-bg: #0a0f1c;
        --vf-bg-elevated: #111827;
        --vf-bg-subtle: #1e293b;
        --vf-text: #eef2f8;
        --vf-text-muted: #94a3b8;
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
        padding: 1.25rem 0.9rem 1rem;
        background: linear-gradient(185deg, var(--vf-sidebar) 0%, var(--vf-sidebar-mid) 60%, var(--vf-sidebar-deep) 130%);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--vf-text-on-dark);
        box-shadow: 4px 0 32px rgb(0 0 0 / 0.25);
      }
      .vf-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.5rem 1rem;
        flex-shrink: 0;
      }
      .vf-brand__mark {
        display: grid;
        place-items: center;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: var(--vf-radius);
        font-family: var(--vf-font-display, inherit);
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #042f1a;
        background: var(--vf-accent-gradient);
        box-shadow:
          0 0 32px var(--vf-accent-glow),
          0 4px 12px rgb(0 0 0 / 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
        transition: transform 0.3s var(--vf-ease);
      }
      .vf-brand__mark:hover {
        transform: scale(1.05) rotate(2deg);
      }
      .vf-brand__text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .vf-brand__title {
        margin: 0;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--vf-text-on-dark);
      }
      .vf-brand__sub {
        margin: 0;
        font-size: 0.7rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--vf-text-on-dark-muted);
      }
      .vf-nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0.25rem 0;
        scrollbar-width: thin;
      }
      .vf-nav__link {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.65rem 0.85rem;
        border-radius: var(--vf-radius-sm);
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
        transition: var(--vf-transition-colors);
        position: relative;
        overflow: hidden;
      }
      .vf-nav__link::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(16, 217, 129, 0.1), transparent);
        transition: left 0.4s;
      }
      .vf-nav__link:hover {
        background: var(--vf-sidebar-hover);
        color: var(--vf-text-on-dark);
      }
      .vf-nav__link:hover::before {
        left: 100%;
      }
      .vf-nav__link.is-active {
        background: var(--vf-sidebar-active);
        color: #a7f3d0;
        border-color: rgba(16, 217, 129, 0.25);
        box-shadow: inset 3px 0 0 var(--vf-accent-light);
      }
      .vf-nav__link.is-active::after {
        content: '';
        position: absolute;
        left: 0;
        top: 25%;
        bottom: 25%;
        width: 3px;
        background: var(--vf-accent-light);
        border-radius: 0 2px 2px 0;
      }
      .vf-nav__link--muted {
        opacity: 0.75;
      }
      .vf-nav__link--btn {
        color: #fca5a5;
      }
      .vf-sidebar__footer {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        flex-shrink: 0;
        padding-top: 0.75rem;
        margin-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }

      /* Theme selector premium */
      .vf-theme-selector {
        position: relative;
        margin-top: 0.25rem;
      }
      .vf-theme-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0.85rem;
        border-radius: var(--vf-radius-sm);
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        color: var(--vf-text-on-dark-muted);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--vf-transition-colors);
        width: 100%;
      }
      .vf-theme-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--vf-text-on-dark);
      }
      .vf-theme-menu {
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 0.5rem;
        background: rgba(17, 24, 39, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: var(--vf-radius);
        padding: 0.5rem;
        min-width: 140px;
        box-shadow: var(--vf-shadow-lg);
        z-index: 1000;
        animation: vf-fade-in 0.2s var(--vf-ease);
      }
      @keyframes vf-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .vf-theme-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: none;
        border-radius: var(--vf-radius-sm);
        background: transparent;
        color: var(--vf-text-on-dark-muted);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--vf-transition-colors);
      }
      .vf-theme-option:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--vf-text-on-dark);
      }
      .vf-theme-option.is-active {
        background: var(--vf-accent-soft);
        color: var(--vf-accent-light);
      }
      .vf-theme-option.is-active lucide-icon {
        color: var(--vf-accent-light);
      }

      .vf-main {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        background: var(--vf-bg);
      }
      .vf-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem 1.5rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--vf-border);
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(14px) saturate(1.2);
        -webkit-backdrop-filter: blur(14px) saturate(1.2);
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
      }
      .vf-shell.vf-theme-dark .vf-topbar {
        background: rgba(17, 24, 39, 0.85);
        border-bottom-color: rgba(255, 255, 255, 0.12);
      }
      .vf-topbar__eyebrow {
        margin: 0;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--vf-text-muted);
      }
      .vf-topbar__tenant {
        margin: 0.15rem 0 0;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--vf-text);
      }
      .vf-topbar__meta {
        margin: 0.2rem 0 0;
        font-size: 0.82rem;
        color: var(--vf-text-muted);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;
      }
      .vf-topbar__slug {
        display: inline-flex;
        padding: 0.15rem 0.55rem;
        border-radius: var(--vf-radius-pill);
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--vf-accent-light);
        background: var(--vf-accent-soft);
        border: 1px solid rgba(16, 217, 129, 0.3);
      }
      .vf-shell.vf-theme-dark .vf-topbar__slug {
        background: rgba(16, 217, 129, 0.15);
      }
      .vf-topbar__sep {
        opacity: 0.5;
      }
      .vf-topbar__badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.9rem;
        border-radius: var(--vf-radius-pill);
        font-size: 0.82rem;
        font-weight: 700;
        color: #047857;
        background: var(--vf-accent-soft);
        border: 1px solid rgba(16, 217, 129, 0.3);
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
        padding: 1.5rem 1.75rem 2.5rem;
        min-width: 0;
        background: var(--vf-bg);
      }
      @media (prefers-reduced-motion: reduce) {
        .vf-nav__link,
        .vf-theme-btn {
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
        .vf-theme-menu {
          position: fixed;
          bottom: auto;
          top: 4rem;
          left: 1rem;
          right: 1rem;
          margin: 0;
        }
      }
    `,
  ],
})
export class VerifactuPlatformShellComponent implements OnInit {
  readonly mainNav: NavItem[] = [
    { label: 'Resumen', route: '/verifactu/overview', icon: 'layout-dashboard' },
    { label: 'Facturas', route: '/verifactu/invoices', icon: 'file-text' },
    { label: 'Cola AEAT', route: '/verifactu/queue', icon: 'list-ordered' },
    { label: 'Series', route: '/verifactu/series', icon: 'hash' },
    { label: 'Historial', route: '/verifactu/logs', icon: 'history' },
    { label: 'Cadena fiscal', route: '/verifactu/chain', icon: 'link-2' },
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
  readonly currentTheme = signal<Theme>('light');
  readonly showThemeMenu = signal(false);

  readonly isDarkTheme = computed(() => this.currentTheme() === 'dark');

  ngOnInit(): void {
    this.refreshSessionContext();
    const savedTheme = localStorage.getItem('vf-theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.currentTheme.set(savedTheme);
    }
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

  toggleThemeMenu(): void {
    this.showThemeMenu.update((v) => !v);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('vf-theme', theme);
    this.showThemeMenu.set(false);
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
