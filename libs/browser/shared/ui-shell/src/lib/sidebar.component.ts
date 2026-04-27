import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { ERP_MAIN_NAV_ITEMS } from './erp-nav-items';

@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside class="sidebar-container" [class.collapsed]="isCollapsed()">
      <!-- Logo & Toggle -->
      <div class="header">
        @if (!isCollapsed()) {
          <div class="logo-area">
            <div class="logo-capsule"></div>
            <span class="logo-text">JOSANZ</span>
          </div>
        }

        <button
          type="button"
          class="toggle-control"
          (click)="toggle()"
          [attr.aria-label]="isCollapsed() ? 'Expandir' : 'Contraer'"
        >
          <lucide-icon
            [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'"
            size="16"
            aria-hidden="true"
          ></lucide-icon>
        </button>
      </div>

      <!-- Main Navigation -->
      <nav class="nav-area">
        <ul class="nav-list">
          @for (item of filteredNavItems(); track item.id) {
            <li class="nav-item">
              <a
                [routerLink]="item.route"
                [routerLinkActiveOptions]="{ exact: item.route === '/' }"
                routerLinkActive="active"
                class="nav-link"
                [attr.title]="item.label"
                [attr.aria-label]="isCollapsed() ? item.label : null"
              >
                <div class="icon-wrapper">
                  <lucide-icon [name]="item.icon" size="18" aria-hidden="true"></lucide-icon>
                </div>
                @if (!isCollapsed()) {
                  <span class="label-text">{{ item.label }}</span>
                  <div class="active-glow"></div>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Footer Actions -->
      <div class="footer-area">
        <ul class="nav-list">
          <li class="nav-item">
            <a
              routerLink="/settings"
              class="nav-link settings-link"
              routerLinkActive="active"
              [attr.aria-label]="isCollapsed() ? 'Configuración' : null"
            >
              <div class="icon-wrapper">
                <lucide-icon name="cog" size="18" aria-hidden="true"></lucide-icon>
              </div>
              @if (!isCollapsed()) {
                <span class="label-text">Configuración</span>
              }
            </a>
          </li>
          <li class="nav-item">
            <button
              type="button"
              class="nav-link logout"
              (click)="logout()"
              [attr.aria-label]="isCollapsed() ? 'Cerrar sesión' : null"
            >
              <div class="icon-wrapper">
                <lucide-icon name="log-out" size="18" aria-hidden="true"></lucide-icon>
              </div>
              @if (!isCollapsed()) {
                <span class="label-text">Cerrar Sesión</span>
              }
            </button>
          </li>
        </ul>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      /* ======================================================
         SIDEBAR — Responsive & Professional
         ====================================================== */
      .sidebar-container {
        width: 220px;
        min-width: 220px;
        height: 100%;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border-soft);
        display: flex;
        flex-direction: column;
        transition: width 0.3s ease;
        color: var(--text-secondary);
        overflow: hidden;
        position: relative;
      }

      /* Brand indicator edge */
      .sidebar-container::after {
        content: '';
        position: absolute;
        top: 0; right: 0; bottom: 0;
        width: 2px;
        background: var(--brand);
        opacity: 0.1;
      }

      .sidebar-container.collapsed {
        width: 56px;
        min-width: 56px;
      }

      .header {
        height: 42px; /* Reduced from 48px to match top nav */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px; /* Reduced from 20px */
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        margin-bottom: 4px;
        transition: padding 0.3s ease;
      }

      .collapsed .header {
        padding: 0;
        justify-content: center;
      }

      .logo-area {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .logo-capsule {
        width: 4px;
        height: 28px;
        background: var(--brand);
        border-radius: 2px;
        box-shadow: 0 0 20px var(--brand-glow);
        animation: logoPulse 3s infinite ease-in-out;
      }

      @keyframes logoPulse {
        0%, 100% { transform: scaleY(1); opacity: 0.8; }
        50% { transform: scaleY(1.1); opacity: 1; filter: brightness(1.2); }
      }

      .logo-text {
        font-weight: 800;
        font-size: 1rem;
        letter-spacing: 0.12em;
        font-family: var(--font-display, 'Inter', system-ui, sans-serif);
        color: var(--text-primary);
      }

      .toggle-control {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.58);
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .toggle-control:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-color: var(--brand);
        box-shadow: 0 0 12px var(--brand-glow);
      }

      .nav-area {
        flex: 1;
        padding: 12px 10px;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .nav-area::-webkit-scrollbar { display: none; }

      .footer-area {
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.3);
      }

      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      /* All nav links — theme-aware */
      .nav-link {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--text-secondary);
        transition: all 0.2s ease;
        position: relative;
        min-height: 40px;
        font-weight: 600;
        font-size: 0.85rem;
        border: 1px solid transparent;
        background: transparent;
        width: 100%;
        cursor: pointer;
      }

      .collapsed .nav-link {
        padding: 10px 0;
        justify-content: center;
      }

      .nav-link:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
        transform: translateX(4px);
      }

      .collapsed .nav-link:hover {
        transform: scale(1.1);
      }

      .nav-link.active {
        background: color-mix(in srgb, var(--brand) 14%, rgba(255,255,255,0.03));
        color: var(--brand);
        border-color: color-mix(in srgb, var(--brand) 28%, transparent);
      }

      .nav-link.active::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 15%; height: 70%;
        width: 3px;
        background: var(--brand);
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 12px var(--brand-glow);
      }

      .active-glow {
        position: absolute;
        right: 0; top: 0; bottom: 0;
        width: 36px;
        background: linear-gradient(to right, transparent, color-mix(in srgb, var(--brand) 12%, transparent));
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .nav-link.active .active-glow { opacity: 1; }

      .logout:hover {
        background: rgba(239, 68, 68, 0.12) !important;
        color: #ff6b6b !important;
        border-color: rgba(239, 68, 68, 0.22) !important;
      }

      .icon-wrapper {
        width: 20px; height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.25s ease;
      }

      .nav-link:hover .icon-wrapper { transform: scale(1.08); }

      .nav-link:focus-visible {
        outline: none;
        background: color-mix(in srgb, var(--brand) 10%, rgba(255, 255, 255, 0.06));
        color: #fff;
        border-color: color-mix(in srgb, var(--brand) 42%, rgba(255, 255, 255, 0.1));
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 32%, transparent);
      }

      .toggle-control:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, var(--brand) 55%, rgba(255, 255, 255, 0.12));
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 28%, transparent);
      }

      .label-text {
        margin-left: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      ::-webkit-scrollbar-track { background: transparent; }

      @media (prefers-reduced-motion: reduce) {
        .sidebar-container {
          transition: none;
        }
        .logo-capsule {
          animation: none;
        }
        .nav-link:hover {
          transform: none;
        }
        .collapsed .nav-link:hover {
          transform: none;
        }
      }
    `,
  ],

})
export class SidebarComponent {
  private readonly identityAuth = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);

  private readonly navItems = ERP_MAIN_NAV_ITEMS;

  /** Entradas del menú: solo módulos/plugins activos. RBAC aplica en features y listas, no aquí. */
  filteredNavItems = computed(() => {
    return this.navItems.filter((item) => {
      if (item.id !== 'dashboard' && item.id !== 'ai-insights' && !this.pluginStore.enabledPlugins().includes(item.id || '')) {
        return false;
      }
      return true;
    });
  });

  isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout() {
    this.identityAuth.logout();
  }
}
