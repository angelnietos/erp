import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarComponent, NavItem } from './sidebar.component';

@Component({
  selector: 'josanz-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <josanz-sidebar [navItems]="navItems" (logoutClick)="logoutClick.emit()"></josanz-sidebar>

      <!-- Main Container -->
      <div class="main-container">
        <!-- Top Navbar -->
        <header class="top-nav">
          <div class="search-container">
            <div class="search-box">
              <lucide-icon name="search" size="18" class="search-icon"></lucide-icon>
              <input type="text" placeholder="Buscar en el ERP..." />
              <div class="search-shortcut">⌘K</div>
            </div>
          </div>

          <div class="actions-container">
            <!-- Tenant Badge -->
            @if (tenantName) {
              <div class="tenant-badge">
                <lucide-icon name="building-2" size="16"></lucide-icon>
                <span>{{ tenantName }}</span>
              </div>
            }

            <button class="icon-btn">
              <lucide-icon name="bell" size="20"></lucide-icon>
              <div class="notification-dot"></div>
            </button>

            <div class="user-profile">
              <div class="user-info">
                <span class="user-name">Antonio Munias</span>
                <span class="user-role">Administrador</span>
              </div>
              <div class="avatar">
                <lucide-icon name="user" size="20"></lucide-icon>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="content-scroll">
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-layout {
      display: flex;
      height: 100%;
      background: #f8fafc;
    }

    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-nav {
      height: 72px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      flex-shrink: 0;
      z-index: 10;
    }

    .search-container {
      flex: 1;
      max-width: 480px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 12px;
      padding: 0 16px;
      height: 44px;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .search-box:focus-within {
      background: #ffffff;
      border-color: #0ea5e9;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }

    .search-icon {
      color: #94a3b8;
    }

    .search-box input {
      background: none;
      border: none;
      width: 100%;
      height: 100%;
      padding-left: 12px;
      color: #1e293b;
      font-size: 0.9375rem;
      outline: none;
    }

    .search-shortcut {
      background: #ffffff;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      pointer-events: none;
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .tenant-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: #f0f9ff;
      color: #0369a1;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid #bae6fd;
    }

    .icon-btn {
      position: relative;
      background: none;
      border: none;
      color: #64748b;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .notification-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-left: 24px;
      border-left: 1px solid #e2e8f0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1e293b;
    }

    .user-role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #0ea5e9, #2563eb);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      background: #f8fafc;
    }

    .content {
      padding: 32px;
      max-width: 1440px;
      margin: 0 auto;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-track {
      background: #f8fafc;
    }
  `]
})
export class AppLayoutComponent {
  readonly logoutClick = output<void>();

  @Input() navItems: NavItem[] = [];
  @Input() tenantName = 'Josanz Audiovisuales S.L.';
}
