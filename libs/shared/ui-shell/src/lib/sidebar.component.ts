import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside 
      class="sidebar-container" 
      [class.collapsed]="isCollapsed()"
    >
      <!-- Logo & Toggle -->
      <div class="header">
        @if (!isCollapsed()) {
          <div class="logo-area">
            <div class="logo-pill"></div>
            <span class="logo-text">JOSANZ</span>
          </div>
        }
        <button class="toggle-btn" (click)="toggle()">
          <lucide-icon [name]="isCollapsed() ? 'menu' : 'chevron-left'" size="20"></lucide-icon>
        </button>
      </div>

      <!-- Main Navigation -->
      <nav class="nav-area">
        <ul class="nav-list">
          @for (item of navItems; track item.id) {
            <li class="nav-item">
              <a 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                class="nav-link"
                [attr.title]="item.label"
              >
                <div class="icon-wrapper">
                  <lucide-icon [name]="item.icon" size="20"></lucide-icon>
                </div>
                @if (!isCollapsed()) {
                  <span class="label-text">{{ item.label }}</span>
                  <div class="active-indicator"></div>
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
            <a routerLink="/settings" class="nav-link secondary">
              <div class="icon-wrapper">
                <lucide-icon name="settings" size="20"></lucide-icon>
              </div>
              @if (!isCollapsed()) {
                <span class="label-text">Configuración</span>
              }
            </a>
          </li>
          <li class="nav-item">
            <button class="nav-link logout">
              <div class="icon-wrapper">
                <lucide-icon name="log-out" size="20"></lucide-icon>
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
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar-container {
      width: 260px;
      height: 100%;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #94a3b8;
      overflow: hidden;
      position: relative;
    }

    .sidebar-container.collapsed {
      width: 80px;
    }

    .header {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }

    .collapsed .header {
      justify-content: center;
      padding: 0;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      animation: fadeIn 0.3s ease;
    }

    .logo-pill {
      width: 12px;
      height: 24px;
      background: linear-gradient(to bottom, #22d3ee, #0ea5e9);
      border-radius: 4px;
      box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
    }

    .logo-text {
      font-weight: 800;
      font-size: 1.25rem;
      color: #f8fafc;
      letter-spacing: 0.1em;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
      transform: scale(1.05);
    }

    .nav-area {
      flex: 1;
      padding: 24px 12px;
      overflow-y: auto;
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
      padding: 12px;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      height: 48px;
    }

    .collapsed .nav-link {
      justify-content: center;
      padding: 12px 0;
    }

    .icon-wrapper {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .label-text {
      margin-left: 16px;
      font-weight: 500;
      font-size: 0.9375rem;
      white-space: nowrap;
      animation: fadeIn 0.2s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #f8fafc;
    }

    .nav-link:hover .icon-wrapper {
      transform: scale(1.1);
    }

    .nav-link.active {
      background: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }

    .active-indicator {
      position: absolute;
      right: 0;
      width: 4px;
      height: 24px;
      background: #0ea5e9;
      border-radius: 4px 0 0 4px;
      box-shadow: -4px 0 12px rgba(14, 165, 233, 0.4);
    }

    .footer-area {
      padding: 20px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .secondary {
      color: #64748b;
    }

    .logout:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    button.nav-link {
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
  `]
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/' },
    { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients' },
    { id: 'inventory', label: 'Inventario', icon: 'package', route: '/inventory' },
    { id: 'budgets', label: 'Presupuestos', icon: 'receipt', route: '/budgets' },
    { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery' },
    { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet' },
    { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals' },
    { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing' },
  ];

  isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
