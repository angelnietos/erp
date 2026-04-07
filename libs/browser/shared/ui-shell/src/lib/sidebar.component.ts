import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Wrench,
  PieChart,
  ShieldCheck,
  Package,
  Receipt,
  Truck,
  Car,
  Key,
  History,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Folder,
  Calendar,
  FileText,
  Clock,
} from 'lucide-angular';
import { AuthStore, PluginStore } from '@josanz-erp/shared-data-access';
import { NavMenuItem } from '@josanz-erp/shared-ui-kit';

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
          class="toggle-control"
          (click)="toggle()"
          [attr.aria-label]="isCollapsed() ? 'Expandir' : 'Contraer'"
        >
          <lucide-icon
            [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'"
            size="16"
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
              >
                <div class="icon-wrapper">
                  <lucide-icon [name]="item.icon" size="18"></lucide-icon>
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
            >
              <div class="icon-wrapper">
                <lucide-icon name="settings" size="18"></lucide-icon>
              </div>
              @if (!isCollapsed()) {
                <span class="label-text">Configuración</span>
              }
            </a>
          </li>
          <li class="nav-item">
            <button class="nav-link logout" (click)="logout()">
              <div class="icon-wrapper">
                <lucide-icon name="log-out" size="18"></lucide-icon>
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
        width: 248px;
        min-width: 248px;
        height: 100%;
        background: linear-gradient(
          165deg,
          color-mix(in srgb, var(--bg-primary, #050608) 92%, var(--brand) 5%) 0%,
          rgba(10, 10, 12, 0.92) 48%,
          rgba(8, 8, 10, 0.94) 100%
        );
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        transition:
          width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
          min-width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--text-secondary);
        overflow: hidden;
        position: relative;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
      }

      /* Neon edge effect */
      .sidebar-container::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 1px;
        background: linear-gradient(
          to bottom,
          transparent,
          var(--brand),
          transparent
        );
        opacity: 0.3;
        box-shadow: 0 0 10px var(--brand-glow);
      }

      .sidebar-container.collapsed {
        width: 68px;
        min-width: 68px;
      }

      .header {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 8px;
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
        0%,
        100% {
          transform: scaleY(1);
          opacity: 0.8;
        }
        50% {
          transform: scaleY(1.1);
          opacity: 1;
          filter: brightness(1.2);
        }
      }

      .logo-text {
        font-weight: 800;
        font-size: 1.05rem;
        letter-spacing: 0.18em;
        font-family: var(--font-display, 'DM Sans', system-ui, sans-serif);
        background: linear-gradient(
          to right,
          #fff,
          color-mix(in srgb, var(--brand) 35%, var(--text-muted))
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .toggle-control {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--text-muted);
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
        background: rgba(255, 255, 255, 0.08);
        color: var(--brand);
        border-color: var(--brand);
        box-shadow: 0 0 15px var(--brand-glow);
      }

      .nav-area {
        flex: 1;
        padding: 12px 10px;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .nav-area::-webkit-scrollbar {
        display: none;
      }

      .footer-area {
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.25);
      }

      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .nav-link {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        border-radius: 12px;
        text-decoration: none;
        color: var(--text-muted);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        min-height: 44px;
        font-weight: 700;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border: 1px solid transparent;
      }

      .collapsed .nav-link {
        padding: 10px 0;
        justify-content: center;
      }

      .nav-link:hover {
        background: color-mix(in srgb, #fff 6%, transparent);
        color: #fff;
        border-color: color-mix(in srgb, var(--brand) 18%, rgba(255, 255, 255, 0.06));
        transform: translateX(5px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }

      .collapsed .nav-link:hover {
        transform: scale(1.1);
      }

      .nav-link.active {
        background: color-mix(in srgb, var(--brand) 10%, transparent);
        color: var(--brand);
        border-color: color-mix(in srgb, var(--brand) 20%, transparent);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .nav-link.active::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 15%;
        height: 70%;
        width: 3px;
        background: var(--brand);
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 15px var(--brand-glow);
      }

      .active-glow {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 40px;
        background: linear-gradient(
          to right,
          transparent,
          color-mix(in srgb, var(--brand) 15%, transparent)
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .nav-link.active .active-glow {
        opacity: 1;
      }

      .logout:hover {
        background: rgba(239, 68, 68, 0.1) !important;
        color: #ff4b4b !important;
        border-color: rgba(239, 68, 68, 0.2) !important;
      }

      .icon-wrapper {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
      }

      .nav-link:hover .icon-wrapper {
        transform: scale(1.1);
      }

      .label-text {
        margin-left: 12px;
        white-space: nowrap;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 3px;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--border-medium);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);

  private readonly navItems: NavMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/',
    },
    { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients' },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: 'file-text',
      route: '/projects',
    },
    { id: 'events', label: 'Eventos', icon: 'calendar', route: '/events' },
    {
      id: 'availability',
      label: 'Disponibilidad',
      icon: 'clock',
      route: '/users/availability',
    },
    { id: 'services', label: 'Servicios', icon: 'wrench', route: '/services' },
    { id: 'reports', label: 'Reportes', icon: 'pie-chart', route: '/reports' },
    { id: 'audit', label: 'Auditoría', icon: 'shield-check', route: '/audit' },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: 'package',
      route: '/inventory',
    },
    {
      id: 'budgets',
      label: 'Presupuestos',
      icon: 'receipt',
      route: '/budgets',
    },
    { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery' },
    { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet' },
    { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals' },
    { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing' },
    {
      id: 'verifactu',
      label: 'VeriFactu',
      icon: 'file-check',
      route: '/verifactu',
    },
  ];

  filteredNavItems = computed(() => {
    const enabled = this.pluginStore.enabledPlugins();
    return this.navItems.filter((item) => enabled.includes(item.id || ''));
  });

  isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout() {
    this.authStore.logout();
  }
}
