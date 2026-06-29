import { Component, inject, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
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
}

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-verifactu-platform-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, GcrmToastStackComponent],
  template: `
    <div class="vf-shell" [class.vf-theme-dark]="isDarkTheme" [class.vf-sidebar-collapsed]="collapsed">
      <aside class="vf-sidebar" aria-label="Navegación Verifactu">
        <div class="vf-sidebar__top">
          <button
            type="button"
            class="vf-sidebar-toggle"
            (click)="toggleSidebar()"
            [attr.aria-label]="collapsed ? 'Expandir menú' : 'Colapsar menú'"
          >
            <lucide-icon [name]="collapsed ? 'chevron-right' : 'menu'" size="18" aria-hidden="true" />
          </button>

          <div class="vf-brand" [class.vf-brand--collapsed]="collapsed">
            @if (!collapsed) {
              <div class="vf-brand__text">
                <p class="vf-brand__title">Verifactu</p>
                <p class="vf-brand__sub">Facturación AEAT</p>
              </div>
            }
          </div>
        </div>

        <nav class="vf-nav">
          @for (item of mainNav; track $index) {
            <a
              class="vf-nav__link"
              [routerLink]="item.route"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: true }"
              [title]="collapsed ? item.label : ''"
            >

              <span class="vf-nav__icon">
                <lucide-icon [name]="item.icon" size="20" aria-hidden="true" />
              </span>
              @if (!collapsed) {
                <span class="vf-nav__label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="vf-sidebar__bottom">
          <a class="vf-nav__link" routerLink="/clients" routerLinkActive="is-active" title="Clientes">
            <span class="vf-nav__icon">
              <lucide-icon name="users" size="20" aria-hidden="true" />
            </span>
            @if (!collapsed) {
              <span class="vf-nav__label">Clientes</span>
            }
          </a>

          @if (!collapsed && erpHubUrl) {
            <a class="vf-nav__link vf-nav__link--muted" [href]="erpHubUrl" target="_blank" rel="noopener" title="Babooni Hub">
              <span class="vf-nav__icon">
                <lucide-icon name="external-link" size="20" aria-hidden="true" />
              </span>
              <span class="vf-nav__label">Babooni Hub</span>
            </a>
          }

          <div class="vf-controls">
            <div class="vf-theme-selector" (click)="toggleThemeMenu()" (keydown.enter)="toggleThemeMenu()" tabindex="0">
              <button type="button" class="vf-theme-btn">
                <lucide-icon [name]="isDarkTheme ? 'moon' : 'sun'" size="16" aria-hidden="true" />
              </button>
              @if (showThemeMenu) {
                <div class="vf-theme-menu">
                  <button type="button" class="vf-theme-option" [class.is-active]="currentTheme === 'light'" (click)="setTheme('light')">
                    <lucide-icon name="sun" size="14" aria-hidden="true" />
                    <span>Claro</span>
                  </button>
                  <button type="button" class="vf-theme-option" [class.is-active]="currentTheme === 'dark'" (click)="setTheme('dark')">
                    <lucide-icon name="moon" size="14" aria-hidden="true" />
                    <span>Oscuro</span>
                  </button>
                </div>
              }
            </div>

            <button type="button" class="vf-nav__link vf-nav__link--danger" (click)="logout()" title="Cerrar sesión">
              <span class="vf-nav__icon">
                <lucide-icon name="log-out" size="20" aria-hidden="true" />
              </span>
              @if (!collapsed) {
                <span class="vf-nav__label">Cerrar sesión</span>
              }
            </button>
          </div>
        </div>
      </aside>

      <div class="vf-main">
        <header class="vf-topbar">
          <div class="vf-topbar__left">
            <p class="vf-topbar__eyebrow">Tenant activo</p>
            <p class="vf-topbar__tenant">{{ tenantName }}</p>
            <p class="vf-topbar__meta">
              <span class="vf-topbar__slug">{{ tenantSlug }}</span>
              @if (userEmail) {
                <span class="vf-topbar__dot" aria-hidden="true"></span>
                <span class="vf-topbar__email">{{ userEmail }}</span>
              }
            </p>
          </div>

          <div class="vf-topbar__right">
            <div class="vf-badge">
              <span class="vf-badge__pulse" aria-hidden="true"></span>
              <span>Cola ERP · Activo</span>
            </div>

            <button
              type="button"
              class="vf-topbar-theme"
              (click)="toggleThemeMenu()"
              [attr.aria-label]="isDarkTheme ? 'Tema oscuro activo' : 'Tema claro activo'"
            >
              <lucide-icon [name]="isDarkTheme ? 'moon' : 'sun'" size="18" aria-hidden="true" />
            </button>

            @if (showThemeMenu) {
              <div class="vf-theme-menu vf-theme-menu--topbar">
                <button type="button" class="vf-theme-option" [class.is-active]="currentTheme === 'light'" (click)="setTheme('light')">
                  <lucide-icon name="sun" size="14" aria-hidden="true" />
                  <span>Claro</span>
                </button>
                <button type="button" class="vf-theme-option" [class.is-active]="currentTheme === 'dark'" (click)="setTheme('dark')">
                  <lucide-icon name="moon" size="14" aria-hidden="true" />
                  <span>Oscuro</span>
                </button>
              </div>
            }
          </div>
        </header>

        <main id="app-main" class="vf-content" tabindex="-1">
          <router-outlet />
        </main>

        <gcrm-toast-stack />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100dvh;
        overflow: hidden;
      }

      /* Shell layout */
      .vf-shell {
        display: grid;
        grid-template-columns: 16rem 1fr;
        height: 100dvh;
        background: var(--vf-bg);
        transition: grid-template-columns 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .vf-shell.vf-sidebar-collapsed {
        grid-template-columns: 4.75rem 1fr;
      }

      .vf-shell.vf-theme-dark {
        --vf-bg: #0a0f1c;
        --vf-bg-elevated: #111827;
        --vf-text: #eef2f8;
        --vf-text-muted: #94a3b8;
      }

      /* Sidebar premium */
      .vf-sidebar {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        background: linear-gradient(180deg, #0a0f1c 0%, #111827 40%, #0d2818 100%);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        color: #eef2f8;
        overflow: hidden;
      }

      .vf-sidebar__top {
        display: flex;
        align-items: center;
        padding: 1rem 0.75rem;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .vf-sidebar-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .vf-sidebar-toggle:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #eef2f8;
        transform: rotate(180deg);
      }

      .vf-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
      }

      .vf-brand__mark {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.9rem;
        color: #042f1a;
        background: linear-gradient(135deg, #34f5a8, #0d9f5f);
        flex-shrink: 0;
        box-shadow:
          0 0 32px rgba(16, 217, 129, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
        transition: transform 0.3s ease;
      }

      .vf-brand__mark:hover {
        transform: scale(1.08) rotate(2deg);
      }

      .vf-brand__text {
        min-width: 0;
      }

      .vf-brand__title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #fff;
      }

      .vf-brand__sub {
        margin: 0;
        font-size: 0.65rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #94a3b8;
      }

      /* Navigation premium */
      .vf-nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 0.5rem;
      }

      .vf-nav__link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.85rem;
        border-radius: 12px;
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 600;
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
        background: linear-gradient(90deg, transparent, rgba(16, 217, 129, 0.15), transparent);
        transition: left 0.4s;
      }

      .vf-nav__link:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #eef2f8;
        transform: translateX(4px);
      }

      .vf-nav__link:hover::before {
        left: 100%;
      }

      .vf-nav__link.is-active {
        background: rgba(16, 217, 129, 0.12);
        color: #a7f3d0;
        border-color: rgba(16, 217, 129, 0.3);
      }

      .vf-nav__link.is-active::after {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        bottom: 20%;
        width: 3px;
        background: #10d981;
        border-radius: 0 2px 2px 0;
      }

      .vf-nav__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .vf-nav__label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .vf-nav__link--muted {
        opacity: 0.7;
      }

      .vf-nav__link--danger {
        color: #fca5a5;
      }

      .vf-nav__link--danger:hover {
        background: rgba(220, 38, 38, 0.12);
        color: #fecaca;
      }

      /* Sidebar bottom */
      .vf-sidebar__bottom {
        flex-shrink: 0;
        padding: 0.75rem 0.75rem 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      /* Controls (theme + logout) */
      .vf-controls {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      /* Theme selector in sidebar */
      .vf-theme-selector {
        position: relative;
        margin-top: 0.25rem;
      }

      .vf-theme-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 0.85rem;
        border-radius: 12px;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s ease;
      }

      .vf-theme-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #eef2f8;
      }

      .vf-theme-menu {
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 0.5rem;
        background: rgba(17, 24, 39, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 0.5rem;
        min-width: 150px;
        box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: vf-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes vf-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .vf-theme-menu--topbar {
        top: 100%;
        bottom: auto;
        margin-top: 0.5rem;
        margin-bottom: 0;
      }

      .vf-theme-option {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        width: 100%;
        padding: 0.6rem 0.85rem;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: #94a3b8;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .vf-theme-option:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #eef2f8;
      }

      .vf-theme-option.is-active {
        background: rgba(16, 217, 129, 0.15);
        color: #10d981;
      }

      /* Main area */
      .vf-main {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        overflow: hidden;
        background: var(--vf-bg);
      }

      /* Topbar premium glass */
      .vf-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--vf-border, #dde4ef);
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(16px) saturate(1.2);
        -webkit-backdrop-filter: blur(16px) saturate(1.2);
        box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
        flex-shrink: 0;
      }

      .vf-shell.vf-theme-dark .vf-topbar {
        background: rgba(17, 24, 39, 0.85);
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .vf-topbar__left {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .vf-topbar__eyebrow {
        margin: 0;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--vf-text-muted, #5c6b82);
      }

      .vf-topbar__tenant {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--vf-text, #0c1222);
      }

      .vf-topbar__meta {
        margin: 0;
        font-size: 0.85rem;
        color: var(--vf-text-muted, #5c6b82);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .vf-topbar__slug {
        display: inline-flex;
        align-items: center;
        padding: 0.2rem 0.7rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #047857;
        background: var(--vf-accent-soft, rgba(16, 217, 129, 0.12));
        border: 1px solid rgba(16, 217, 129, 0.3);
      }

      .vf-shell.vf-theme-dark .vf-topbar__slug {
        background: rgba(16, 217, 129, 0.15);
      }

      .vf-topbar__dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--vf-border, #dde4ef);
      }

      .vf-topbar__right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .vf-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 1rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 700;
        color: #047857;
        background: var(--vf-accent-soft, rgba(16, 217, 129, 0.12));
        border: 1px solid rgba(16, 217, 129, 0.3);
        box-shadow: var(--vf-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
      }

      .vf-badge__pulse {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10d981;
        box-shadow: 0 0 0 0 rgba(16, 217, 129, 0.5);
        animation: vf-pulse 2s ease-out infinite;
      }

      @keyframes vf-pulse {
        70% { box-shadow: 0 0 0 8px rgba(16, 217, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 217, 129, 0); }
      }

      .vf-topbar-theme {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid rgba(16, 217, 129, 0.3);
        background: var(--vf-accent-soft, rgba(16, 217, 129, 0.12));
        color: #10d981;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .vf-topbar-theme:hover {
        background: rgba(16, 217, 129, 0.2);
        transform: scale(1.05);
      }

      /* Content area */
      .vf-content {
        flex: 1;
        padding: 1.5rem 2rem 2.5rem;
        overflow-y: auto;
        min-width: 0;
        background: var(--vf-bg, #f3f6fb);
      }

      /* Mobile responsive */
      @media (max-width: 900px) {
        .vf-shell {
          grid-template-columns: 1fr !important;
        }
        .vf-sidebar {
          flex-direction: row;
          height: auto;
          padding: 0.75rem;
          border-right: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .vf-nav {
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0;
          overflow: visible;
        }
        .vf-sidebar__bottom {
          flex-direction: row;
          border-top: none;
          padding: 0 0 0 0.75rem;
        }
        .vf-theme-menu {
          position: fixed;
          top: 4rem;
          left: 1rem;
          right: 1rem;
          margin: 0;
          bottom: auto;
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

  collapsed = false;
  currentTheme: Theme = 'light';
  showThemeMenu = false;
  userEmail: string | null = null;

  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }

  get tenantSlug(): string {
    return (
      normalizeTenantSlug(this.session.tenantSlug()) ??
      environment.defaultTenantSlug ??
      'demo'
    );
  }

  get tenantName(): string {
    return resolveTenantDisplayName(this.tenantSlug, this.session.tenantName());
  }

  ngOnInit(): void {
    this.loadSavedTheme();
    this.refreshSessionContext();
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('vf-theme') as Theme | null;
    this.currentTheme = savedTheme ?? 'light';
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
        this.userEmail = res.user.email;
      },
      error: () => {
        /* ignore — topbar uses stored tenant context */
      },
    });
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  toggleThemeMenu(): void {
    this.showThemeMenu = !this.showThemeMenu;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem('vf-theme', theme);
    this.showThemeMenu = false;
  }

  logout(): void {
    const tenantSlug = this.session.getTenantSlug()?.trim() || environment.defaultTenantSlug;
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
