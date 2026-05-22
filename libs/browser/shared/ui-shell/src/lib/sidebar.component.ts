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
            <div class="logo-capsule">
              <div class="logo-inner"></div>
            </div>
            <div class="logo-brand">
              <span class="logo-text">JOSANZ</span>
              <span class="logo-tag">PRO</span>
            </div>
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

      .sidebar-container {
        width: 190px;
        min-width: 190px;
        height: 100%;
        background: linear-gradient(165deg, #0a0a0f 0%, #060609 100%);
        backdrop-filter: blur(24px);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        color: rgba(255, 255, 255, 0.6);
        position: relative;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.4);
      }

      .sidebar-container.collapsed {
        width: 64px;
        min-width: 64px;
      }

      .header {
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        flex-shrink: 0;
      }

      .logo-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-capsule {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, var(--brand), var(--brand-muted));
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px var(--brand-glow);
        position: relative;
      }

      .logo-inner {
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 2px;
        transform: rotate(45deg);
      }

      .logo-brand {
        display: flex;
        flex-direction: column;
      }

      .logo-text {
        font-family: 'Outfit', var(--font-display);
        font-weight: 800;
        font-size: 1.15rem;
        letter-spacing: 0.05em;
        color: #fff;
        line-height: 1;
      }

      .logo-tag {
        font-size: 0.6rem;
        font-weight: 700;
        color: var(--brand);
        letter-spacing: 0.2em;
        margin-top: 2px;
      }

      .toggle-control {
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .toggle-control:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border-color: var(--brand);
      }

      .nav-area {
        flex: 1;
        padding: 8px 12px;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .nav-area::-webkit-scrollbar { display: none; }

      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .nav-link {
        height: 44px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        color: rgba(255, 255, 255, 0.55);
        text-decoration: none;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        background: transparent;
        border: 1px solid transparent;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.03);
        color: #fff;
        transform: translateX(4px);
      }

      .collapsed .nav-link:hover { transform: scale(1.05); }

      .nav-link.active {
        background: var(--brand-surface);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.05);
      }

      .nav-link.active::after {
        content: '';
        position: absolute;
        left: 0;
        top: 25%;
        bottom: 25%;
        width: 3px;
        background: var(--brand);
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 10px var(--brand);
      }

      .nav-link.active .icon-wrapper {
        color: var(--brand);
        transform: scale(1.1);
        filter: drop-shadow(0 0 8px var(--brand-glow));
      }

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
