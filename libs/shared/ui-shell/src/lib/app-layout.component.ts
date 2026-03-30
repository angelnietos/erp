import { Component, Input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarComponent } from './sidebar.component';
import { NavMenuItem } from '@josanz-erp/shared-ui-kit';
import { ThemeService, Theme } from '@josanz-erp/shared-data-access';
import { NotificationDrawerComponent } from './notification-drawer.component';

@Component({
  selector: 'josanz-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SidebarComponent, NotificationDrawerComponent],
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

            <button class="icon-btn" (click)="toggleNotifications()">
              <lucide-icon name="bell" size="20"></lucide-icon>
              <div class="notification-dot"></div>
            </button>

            <!-- Theme Selector -->
            <div class="theme-selector">
              <button class="theme-btn" (click)="toggleThemeMenu()">
                <lucide-icon [name]="currentTheme() === 'dark' ? 'moon' : 'sun'" size="20"></lucide-icon>
              </button>
              @if (showThemeMenu()) {
                <div class="theme-menu">
                  @for (themeKey of themeKeys; track themeKey) {
                    <button 
                      class="theme-option" 
                      [class.active]="currentTheme() === themeKey"
                      (click)="setTheme(themeKey)"
                    >
                      <span class="theme-color" [style.background]="themeService.themes[themeKey].primary"></span>
                      {{ themeService.themes[themeKey].name }}
                    </button>
                  }
                </div>
              }
            </div>

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

        <!-- Notification Drawer -->
        @if (showNotifications()) {
          <josanz-notification-drawer (closeDrawer)="toggleNotifications()"></josanz-notification-drawer>
        }

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
      font-family: var(--font-main);
    }

    .app-layout {
      display: flex;
      height: 100%;
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .top-nav {
      height: 72px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      flex-shrink: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .search-container {
      flex: 1;
      max-width: 520px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--bg-tertiary);
      border-radius: 6px;
      padding: 0 16px;
      height: 42px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--border-soft);
    }

    .search-box:focus-within {
      background: var(--bg-secondary);
      border-color: var(--brand);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    .search-icon {
      color: var(--text-muted);
      transition: color 0.3s ease;
    }

    .search-box:focus-within .search-icon {
      color: var(--brand);
    }

    .search-box input {
      background: none;
      border: none;
      width: 100%;
      height: 100%;
      padding-left: 12px;
      color: var(--text-primary);
      font-size: 0.9rem;
      outline: none;
      font-family: var(--font-main);
    }
    
    .search-box input::placeholder {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .search-shortcut {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      font-size: 0.65rem;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-soft);
      pointer-events: none;
      font-family: var(--font-display);
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .tenant-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      background: rgba(240, 62, 62, 0.1);
      color: var(--brand);
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .icon-btn {
      position: relative;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      color: var(--text-secondary);
      width: 42px;
      height: 42px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .icon-btn:hover {
      background: var(--bg-secondary);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--brand);
      border: 2px solid var(--bg-secondary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .theme-selector {
      position: relative;
    }

    .theme-btn {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      color: var(--text-secondary);
      width: 42px;
      height: 42px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .theme-btn:hover {
      border-color: var(--brand);
      color: #fff;
    }

    .theme-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 10px;
      min-width: 180px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 200;
      animation: menuFadeIn 0.3s ease;
    }
    
    @keyframes menuFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .theme-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 14px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .theme-option:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
    }

    .theme-option.active {
      background: rgba(240, 62, 62, 0.1);
      color: var(--brand);
    }

    .theme-color {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-left: 20px;
      border-left: 1px solid var(--border-soft);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 800;
      font-size: 0.9rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: var(--font-display);
    }

    .user-role {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--brand), #a00);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 0 15px var(--brand-glow);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-primary);
    }

    .content {
      padding: 40px;
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--brand); }
    ::-webkit-scrollbar-track { background: var(--bg-primary); }
  `]
})
export class AppLayoutComponent {
  readonly logoutClick = output<void>();
  readonly themeService = inject(ThemeService);
  readonly currentTheme = this.themeService.currentTheme;
  readonly themeKeys = Object.keys(this.themeService.themes) as Theme[];
  showThemeMenu = signal(false);

  @Input() navItems: NavMenuItem[] = [];
  @Input() tenantName = 'Josanz Audiovisuales S.L.';
  showNotifications = signal(false);

  toggleThemeMenu() {
    this.showThemeMenu.update(v => !v);
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.showThemeMenu.set(false);
  }
}
