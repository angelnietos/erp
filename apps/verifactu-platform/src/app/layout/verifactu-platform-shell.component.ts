import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
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

type Theme = 'light' | 'dark' | 'forest' | 'cyberpunk';

interface ThemeDot {
  key: Theme;
  label: string;
  color: string;
  ring: string;
}

@Component({
  selector: 'app-verifactu-platform-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, GcrmToastStackComponent, NgClass],
  template: `
    <div class="vf-shell" [ngClass]="['vf-theme-' + currentTheme, collapsed ? 'vf-sidebar-collapsed' : '']">
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
            @if (!collapsed) {
              <div class="vf-theme-picker">
                <p class="vf-theme-picker__label">Tema</p>
                <div class="vf-theme-picker__dots">
                  @for (t of themes; track t.key) {
                    <button
                      type="button"
                      class="vf-theme-dot"
                      [class.is-active]="currentTheme === t.key"
                      [style.--dot-color]="t.color"
                      [style.--dot-ring]="t.ring"
                      [attr.aria-label]="'Tema ' + t.label"
                      [title]="t.label"
                      (click)="setTheme(t.key)"
                    ></button>
                  }
                </div>
              </div>
            }

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

            <div class="vf-theme-picker vf-theme-picker--topbar">
              @for (t of themes; track t.key) {
                <button
                  type="button"
                  class="vf-theme-dot"
                  [class.is-active]="currentTheme === t.key"
                  [style.--dot-color]="t.color"
                  [style.--dot-ring]="t.ring"
                  [attr.aria-label]="'Tema ' + t.label"
                  [title]="t.label"
                  (click)="setTheme(t.key)"
                ></button>
              }
            </div>
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

      /* Sidebar por tema */
      .vf-theme-light .vf-sidebar {
        background: linear-gradient(180deg, #1a2640 0%, #1e3a52 50%, #12281a 100%);
      }
      .vf-theme-forest .vf-sidebar {
        background: linear-gradient(180deg, #040d06 0%, #071209 40%, #0a1a0f 100%);
      }
      .vf-theme-cyberpunk .vf-sidebar {
        background: linear-gradient(180deg, #020203 0%, #06060c 35%, #0a0a18 70%, #12050a 100%);
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
        overflow-x: hidden;
        padding: 0.5rem;
      }

      .vf-nav::-webkit-scrollbar {
        width: 4px;
      }
      .vf-nav::-webkit-scrollbar-track {
        background: transparent;
      }
      .vf-nav::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 2px;
      }
      .vf-nav::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
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
        transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
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
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        transform: scale(1.02) translateX(4px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
      }

      .vf-nav__link:hover::before {
        left: 100%;
      }

      .vf-nav__link.is-active {
        background: rgba(16, 217, 129, 0.14);
        color: #34f5a8;
        border-color: rgba(16, 217, 129, 0.4);
        box-shadow: 0 0 16px rgba(16, 217, 129, 0.2);
      }

      .vf-nav__link.is-active::after {
        content: '';
        position: absolute;
        left: 0;
        top: 15%;
        bottom: 15%;
        width: 4px;
        background: #34f5a8;
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 10px rgba(52, 245, 168, 0.8);
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

      /* ===== Theme Dot Picker ===== */
      .vf-theme-picker {
        padding: 0.5rem 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .vf-theme-picker__label {
        margin: 0;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.3);
      }

      .vf-theme-picker__dots {
        display: flex;
        gap: 0.45rem;
        align-items: center;
      }

      .vf-theme-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--dot-color, #fff);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        padding: 0;
        flex-shrink: 0;
      }

      .vf-theme-dot:hover {
        transform: scale(1.25);
        box-shadow: 0 0 12px var(--dot-ring, rgba(255,255,255,0.5));
      }

      .vf-theme-dot.is-active {
        transform: scale(1.2);
        border-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 0 3px var(--dot-ring, rgba(255,255,255,0.3)), 0 0 14px var(--dot-ring, rgba(255,255,255,0.4));
      }

      /* Topbar dot picker */
      .vf-theme-picker--topbar {
        flex-direction: row;
        padding: 0;
        gap: 0.4rem;
        align-items: center;
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

      .vf-shell.vf-theme-dark .vf-topbar,
      .vf-shell.vf-theme-forest .vf-topbar,
      .vf-shell.vf-theme-cyberpunk .vf-topbar {
        background: rgba(10, 10, 20, 0.82);
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .vf-shell.vf-theme-forest .vf-topbar {
        background: rgba(4, 13, 6, 0.85);
        border-bottom-color: rgba(102, 187, 106, 0.12);
      }

      .vf-shell.vf-theme-cyberpunk .vf-topbar {
        background: rgba(2, 2, 3, 0.88);
        border-bottom-color: rgba(167, 139, 250, 0.12);
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

  readonly themes: ThemeDot[] = [
    { key: 'light',     label: 'Claro',     color: '#e2e8f0', ring: 'rgba(148,163,184,0.6)' },
    { key: 'dark',      label: 'Oscuro',    color: '#1e293b', ring: 'rgba(52,245,168,0.5)' },
    { key: 'forest',    label: 'Bosque',    color: '#2e7d32', ring: 'rgba(102,187,106,0.5)' },
    { key: 'cyberpunk', label: 'Cyberpunk', color: '#6d28d9', ring: 'rgba(250,204,21,0.5)' },
  ];

  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark' || this.currentTheme === 'forest' || this.currentTheme === 'cyberpunk';
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

  toggleTheme(): void {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
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
