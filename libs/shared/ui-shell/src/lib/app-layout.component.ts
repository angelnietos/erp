import { Component, Input, output, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarComponent } from './sidebar.component';
import { NavMenuItem } from '@josanz-erp/shared-ui-kit';
import { ThemeService, Theme, AuthStore } from '@josanz-erp/shared-data-access';
import { NotificationDrawerComponent } from './notification-drawer.component';
import { CommandPaletteComponent } from './command-palette.component';
import { CrmBackgroundComponent } from './crm-background/crm-background.component';

@Component({
  selector: 'josanz-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SidebarComponent, NotificationDrawerComponent, CommandPaletteComponent, CrmBackgroundComponent],
  template: `
    <josanz-crm-background></josanz-crm-background>
    <div class="app-layout" style="position: relative; z-index: 1;">
      <!-- Sidebar -->
      <josanz-sidebar [navItems]="navItems" (logoutClick)="logoutClick.emit()"></josanz-sidebar>

      <!-- Main Container -->
      <div class="main-container">
        <!-- Top Navbar -->
        <header class="top-nav">
          <div class="search-container">
            <div class="search-box" (click)="toggleCommandPalette()" (keydown.enter)="toggleCommandPalette()" tabindex="0" role="button" aria-label="Abrir paleta de comandos">
              <lucide-icon name="search" size="18" class="search-icon"></lucide-icon>
              <input type="text" placeholder="Buscar en el ERP..." readonly />
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

            <div class="user-profile" (click)="toggleUserMenu()" (keydown.enter)="toggleUserMenu()" tabindex="0" role="button" aria-label="Abrir panel de usuario">
              <div class="user-info">
                <span class="user-name">Antonio Munias</span>
                <span class="user-role">Administrador</span>
              </div>
              <div class="avatar">
                <lucide-icon name="user" size="20"></lucide-icon>
              </div>

              @if (showUserMenu()) {
                <div class="user-menu animate-fade-in">
                  <div class="menu-header">
                    <span class="text-uppercase">SISTEMA CORE v2.1</span>
                  </div>
                  <button class="menu-item" routerLink="/settings">
                    <lucide-icon name="settings" size="16"></lucide-icon>
                    CONFIGURACIÓN
                  </button>
                  <button class="menu-item logout" (click)="logout()">
                    <lucide-icon name="log-out" size="16"></lucide-icon>
                    CERRAR SESIÓN
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Notification Drawer -->
        @if (showNotifications()) {
          <josanz-notification-drawer (closeDrawer)="toggleNotifications()"></josanz-notification-drawer>
        }

        <!-- Command Palette -->
        @if (showCommandPalette()) {
          <josanz-command-palette (closePalette)="closeCommandPalette()"></josanz-command-palette>
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
      background: transparent;
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
      height: 56px;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
      z-index: 100;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
    }

    .search-container {
      flex: 1;
      max-width: 400px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      padding: 0 12px;
      height: 34px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }

    .search-box:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .search-box:focus-within {
      background: rgba(255, 255, 255, 0.05);
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
      padding-left: 8px;
      color: var(--text-primary);
      font-size: 0.78rem;
      outline: none;
      font-family: var(--font-main);
      cursor: pointer;
    }
    
    .search-box input::placeholder {
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 0.58rem;
      font-weight: 600;
    }

    .search-shortcut {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      font-size: 0.65rem;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      pointer-events: none;
      font-family: var(--font-display);
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tenant-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: color-mix(in srgb, var(--brand) 12%, transparent);
      color: var(--brand);
      border-radius: 6px;
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border: 1px solid var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
    }

    .icon-btn {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-color: var(--brand);
      box-shadow: 0 0 10px var(--brand-glow);
      transform: translateY(-1px);
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
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-btn:hover {
      border-color: var(--brand);
      color: #fff;
      transform: scale(1.05);
    }

    .theme-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 12px;
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 10px;
      min-width: 180px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 200;
      animation: menuFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .theme-option:hover {
      background: rgba(255, 255, 255, 0.05);
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
      position: relative;
      cursor: pointer;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 700;
      font-size: 0.68rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-family: var(--font-main);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-role {
      font-size: 0.55rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--brand), #a00);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 0 15px var(--brand-glow);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.2s;
    }

    .user-profile:hover .avatar {
      transform: scale(1.05);
    }

    .user-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 16px;
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 12px;
      min-width: 220px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
      z-index: 200;
    }

    .menu-header {
      padding: 8px 12px 16px;
      border-bottom: 1px solid var(--border-soft);
      margin-bottom: 8px;
    }

    .menu-header span {
      font-size: 0.65rem;
      font-weight: 900;
      color: var(--text-muted);
      letter-spacing: 0.15em;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--text-secondary);
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .menu-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .menu-item.logout {
      margin-top: 4px;
    }

    .menu-item.logout:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      /* Opaque bg would hide the fixed CRM canvas (josanz-crm-background) behind the layout */
      background: transparent;
    }

    .content {
      padding: 0 16px 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: var(--border-medium); border-radius: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }

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
  showCommandPalette = signal(false);
  showUserMenu = signal(false);

  private readonly authStore = inject(AuthStore);

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    }
  }

  toggleThemeMenu() {
    this.showThemeMenu.update(v => !v);
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  toggleCommandPalette() {
    this.showCommandPalette.update(v => !v);
  }

  closeCommandPalette() {
    this.showCommandPalette.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
  }

  logout() {
    this.authStore.logout();
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.showThemeMenu.set(false);
  }
}
