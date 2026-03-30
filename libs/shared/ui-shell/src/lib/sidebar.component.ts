import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '@josanz-erp/shared-data-access';
import { NavMenuComponent, NavMenuItem } from '@josanz-erp/shared-ui-kit';



@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NavMenuComponent],
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
        <ui-josanz-nav-menu [items]="navItems"></ui-josanz-nav-menu>
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
            <button class="nav-link logout" (click)="logout()">
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
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-soft);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--text-secondary);
      overflow: hidden;
      position: relative;
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
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
      border-bottom: 1px solid var(--border-soft);
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
      width: 10px;
      height: 20px;
      background: var(--brand);
      border-radius: 2px;
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .logo-text {
      font-weight: 900;
      font-size: 1.1rem;
      color: #fff;
      letter-spacing: 0.2em;
      font-family: var(--font-display);
    }

    .toggle-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      border-color: var(--brand);
      color: #fff;
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .nav-area {
      flex: 1;
      padding: 24px 0;
      overflow-y: auto;
    }

    .footer-area {
      padding: 20px 12px;
      border-top: 1px solid var(--border-soft);
      background: rgba(0, 0, 0, 0.1);
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin: 0 8px;
      border-radius: 4px;
      text-decoration: none;
      color: var(--text-secondary);
      transition: all 0.3s ease;
      position: relative;
      height: 44px;
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .collapsed .nav-link {
      justify-content: center;
      margin: 0 12px;
    }

    .icon-wrapper {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .label-text {
      margin-left: 16px;
      white-space: nowrap;
      animation: fadeIn 0.2s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
      border-bottom: 1px solid var(--brand);
    }

    .logout:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      color: var(--danger) !important;
      border-bottom-color: var(--danger) !important;
    }

    button.nav-link {
      width: calc(100% - 16px);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class SidebarComponent {
  private readonly authStore = inject(AuthStore);

  @Input() navItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/' },
    { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients' },
    { id: 'inventory', label: 'Inventario', icon: 'package', route: '/inventory' },
    { id: 'budgets', label: 'Presupuestos', icon: 'receipt', route: '/budgets' },
    { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery' },
    { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet' },
    { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals' },
    { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing' },
    { id: 'verifactu', label: 'VeriFactu', icon: 'file-check', route: '/verifactu' },
  ];

  isCollapsed = signal(false);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  logout() {
    this.authStore.logout();
  }
}
