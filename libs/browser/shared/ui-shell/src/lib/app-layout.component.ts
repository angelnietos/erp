import {
  Component,
  Input,
  output,
  inject,
  signal,
  computed,
  HostListener,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarComponent } from './sidebar.component';
import {
  ThemeService,
  Theme,
  PluginStore,
  AIBotStore,
  getAiFeatureFromUrl,
} from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { NotificationDrawerComponent } from './notification-drawer.component';
import { CommandPaletteComponent } from './command-palette.component';
import { CrmBackgroundComponent } from './crm-background/crm-background.component';
import { ToastStackComponent } from './toast-stack.component';
import { UIAIChatComponent } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'josanz-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    SidebarComponent,
    NotificationDrawerComponent,
    CommandPaletteComponent,
    CrmBackgroundComponent,
    ToastStackComponent,
    UIAIChatComponent,
  ],
  template: `
    <josanz-crm-background></josanz-crm-background>
    <josanz-toast-stack />
    <div class="app-layout" style="position: relative; z-index: 1;">
      <a href="#erp-main-content" class="erp-skip-link">Saltar al contenido principal</a>
      <!-- Sidebar -->
      <josanz-sidebar (logoutClick)="logoutClick.emit()"></josanz-sidebar>

      <!-- Main Container -->
      <div class="main-container">
        <!-- Top Navbar -->
        <header class="top-nav">
          <div class="search-container">
            <div
              class="search-box"
              (click)="toggleCommandPalette()"
              (keydown.enter)="toggleCommandPalette()"
              tabindex="0"
              role="button"
              aria-label="Abrir paleta de comandos"
            >
              <lucide-icon
                name="search"
                size="18"
                class="search-icon"
                aria-hidden="true"
              ></lucide-icon>
              <input type="text" placeholder="Buscar en el ERP..." readonly />
              <div class="search-shortcut">⌘K</div>
            </div>
          </div>

          <div class="actions-container">
            <!-- Tenant Badge -->
            @if (tenantName) {
              <div class="tenant-badge">
                <lucide-icon name="building-2" size="16" aria-hidden="true"></lucide-icon>
                <span>{{ tenantName }}</span>
              </div>
            }

            <!-- Companion Presence -->
            <button 
              type="button" 
              class="icon-btn companion-presence"
              [class.active]="aiBotStore.activeBotFeature()"
              (click)="toggleAssistant()"
              [title]="'Hablar con ' + aiBotStore.getBotDisplayName(aiBotStore.activeBotFeature())"
            >
              <div class="buddy-mini-glow"></div>
              <lucide-icon name="bot" size="20" aria-hidden="true"></lucide-icon>
            </button>

            <button
              type="button"
              class="icon-btn"
              (click)="toggleNotifications()"
              aria-label="Notificaciones"
            >
              <lucide-icon name="bell" size="20" aria-hidden="true"></lucide-icon>
              <div class="notification-dot" aria-hidden="true"></div>
            </button>

            @if (premiumExperience()) {
              <div
                class="premium-status animate-fade-in"
                [style.color]="currentThemeData().primary"
                [style.border-color]="currentThemeData().primary + '44'"
              >
                <lucide-icon name="sparkles" size="14" aria-hidden="true"></lucide-icon>
                <span>LUXE MODE</span>
              </div>
            }

            <!-- Theme Selector -->
            <div class="theme-selector">
              <button
                type="button"
                class="theme-btn"
                (click)="toggleThemeMenu()"
                [attr.aria-label]="
                  showThemeMenu() ? 'Cerrar selector de tema' : 'Abrir selector de tema'
                "
                [attr.aria-expanded]="showThemeMenu()"
              >
                <lucide-icon
                  [name]="currentTheme() === 'dark' ? 'moon' : 'sun'"
                  size="20"
                  aria-hidden="true"
                ></lucide-icon>
              </button>
              @if (showThemeMenu()) {
                <div
                  class="theme-menu"
                  role="listbox"
                  aria-label="Elegir tema visual"
                >
                  @for (
                    section of themeService.themeMenuSections;
                    track section.id
                  ) {
                    <div
                      class="theme-section"
                      role="group"
                      [attr.aria-label]="section.label"
                    >
                      <div class="theme-section-label">{{ section.label }}</div>
                      @for (themeKey of section.keys; track themeKey) {
                        <button
                          type="button"
                          class="theme-option"
                          role="option"
                          [attr.aria-selected]="currentTheme() === themeKey"
                          [class.active]="currentTheme() === themeKey"
                          (click)="setTheme(themeKey)"
                        >
                          <span
                            class="theme-color"
                            [style.background]="
                              themeService.themes[themeKey].primary
                            "
                          ></span>
                          <span class="theme-option-name">{{
                            themeService.themes[themeKey].name
                          }}</span>
                        </button>
                      }
                    </div>
                  }

                  <!-- Density Selector -->
                  <div class="theme-section density-section" role="group" aria-label="Densidad de interfaz">
                    <div class="theme-section-label">Densidad de interfaz</div>
                    <div class="density-options">
                      <button 
                        type="button" 
                        class="density-btn"
                        [class.active]="themeService.currentDensity() === 'compact'"
                        (click)="themeService.setDensity('compact')"
                      >
                        <lucide-icon name="shrink" size="14"></lucide-icon>
                        Compacta
                      </button>
                      <button 
                        type="button" 
                        class="density-btn"
                        [class.active]="themeService.currentDensity() === 'standard'"
                        (click)="themeService.setDensity('standard')"
                      >
                        <lucide-icon name="maximize-2" size="14"></lucide-icon>
                        Normal
                      </button>
                      <button 
                        type="button" 
                        class="density-btn"
                        [class.active]="themeService.currentDensity() === 'spacious'"
                        (click)="themeService.setDensity('spacious')"
                      >
                        <lucide-icon name="expand" size="14"></lucide-icon>
                        Amplia
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div
              class="user-profile"
              (click)="toggleUserMenu()"
              (keydown.enter)="toggleUserMenu()"
              tabindex="0"
              role="button"
              aria-label="Abrir panel de usuario"
            >
              <div class="user-info">
                <span class="user-name">Antonio Munias</span>
                <span class="user-role">Administrador</span>
              </div>
              <div class="avatar">
                <lucide-icon name="user" size="20" aria-hidden="true"></lucide-icon>
              </div>

              @if (showUserMenu()) {
                <div class="user-menu animate-fade-in">
                  <div class="menu-header">
                    <span class="text-uppercase">SISTEMA CORE v2.1</span>
                  </div>
                  <button type="button" class="menu-item" routerLink="/settings">
                    <lucide-icon name="settings" size="16" aria-hidden="true"></lucide-icon>
                    CONFIGURACIÓN
                  </button>
                  <button type="button" class="menu-item logout" (click)="logout()">
                    <lucide-icon name="log-out" size="16" aria-hidden="true"></lucide-icon>
                    CERRAR SESIÓN
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Notification Drawer -->
        @if (showNotifications()) {
          <josanz-notification-drawer
            (closeDrawer)="toggleNotifications()"
          ></josanz-notification-drawer>
        }

        <!-- Command Palette -->
        @if (showCommandPalette()) {
          <josanz-command-palette
            (closePalette)="closeCommandPalette()"
          ></josanz-command-palette>
        }

        <!-- Dynamic Content -->
        <main id="erp-main-content" class="content-scroll" tabindex="-1">
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </main>

        <!-- Buddy: global companion always present -->
        <ui-ai-assistant
          [feature]="aiBotStore.activeBotFeature()"
          assistantRole="buddy"
          #mainAssistant
        ></ui-ai-assistant>
        <!-- Domain specialist: the bot for the current feature -->
        @if (routeDomain() && routeDomain() !== aiBotStore.activeBotFeature()) {
          <ui-ai-assistant
            [feature]="routeDomain()"
            assistantRole="domain"
          ></ui-ai-assistant>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
        font-family: var(--font-main);
        font-size: 14px; /* Scaled down base */
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
        height: 42px;
        background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
        backdrop-filter: blur(18px) saturate(1.15);
        -webkit-backdrop-filter: blur(18px) saturate(1.15);
        border-bottom: 1px solid var(--border-soft);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        flex-shrink: 0;
        z-index: 5000;
        box-shadow: 0 4px 24px color-mix(in srgb, var(--bg-primary) 40%, transparent);
      }

      .search-container {
        flex: 1;
        max-width: 400px;
      }

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 6px;
        padding: 0 10px;
        height: 30px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.04);
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

      .search-box:focus-visible {
        outline: none;
        border-color: var(--brand);
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--brand) 28%, transparent),
          0 0 15px var(--brand-glow);
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

      .companion-presence {
        color: var(--brand);
        border-color: color-mix(in srgb, var(--brand) 40%, transparent);
        background: color-mix(in srgb, var(--brand) 8%, transparent);
      }

      .companion-presence:hover {
        background: color-mix(in srgb, var(--brand) 15%, transparent);
        box-shadow: 0 0 20px var(--brand-glow);
      }

      .buddy-mini-glow {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 50% 50%, var(--brand), transparent 70%);
        opacity: 0.15;
        filter: blur(4px);
        animation: pulse 2s infinite alternate;
      }

      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        border-color: var(--brand);
        box-shadow: 0 0 10px var(--brand-glow);
        transform: translateY(-1px);
      }

      .icon-btn:focus-visible,
      .theme-btn:focus-visible {
        outline: none;
        border-color: var(--brand);
        color: #fff;
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 35%, transparent);
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
        background: color-mix(
          in srgb,
          var(--bg-secondary) 96%,
          var(--brand) 4%
        );
        backdrop-filter: blur(20px) saturate(1.2);
        -webkit-backdrop-filter: blur(20px) saturate(1.2);
        border: 1px solid color-mix(in srgb, var(--brand) 22%, var(--border-soft));
        border-radius: 14px;
        padding: 8px 6px 10px;
        min-width: 228px;
        max-width: min(92vw, 300px);
        max-height: min(calc(100vh - 5.5rem), 28rem);
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--text-muted) 50%, transparent)
          transparent;
        -webkit-overflow-scrolling: touch;
        box-shadow:
          0 4px 6px rgba(0, 0, 0, 0.08),
          0 18px 48px rgba(0, 0, 0, 0.35),
          0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);
        z-index: 5100;
        animation: menuFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .theme-menu::-webkit-scrollbar {
        width: 6px;
      }

      .theme-menu::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--text-muted) 45%, transparent);
        border-radius: 10px;
      }

      .theme-menu::-webkit-scrollbar-track {
        background: transparent;
      }

      .theme-section:not(:first-child) {
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .theme-section-label {
        padding: 6px 12px 4px;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-muted);
        opacity: 0.9;
      }
      .theme-option.active .theme-option-name {
        color: var(--brand);
        font-weight: 700;
      }

      .density-section {
        border-top: 1px solid var(--border-soft);
        padding-top: 12px !important;
        margin-top: 8px;
      }

      .density-options {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
        margin-top: 8px;
      }

      .density-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 4px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-soft);
        border-radius: 8px;
        color: var(--text-muted);
        font-size: 0.65rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .density-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--brand-border-soft);
        color: var(--text-primary);
      }

      .density-btn.active {
        background: var(--brand-surface);
        border-color: var(--brand);
        color: var(--brand);
      }

      .theme-option-name {
        flex: 1;
        min-width: 0;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @keyframes menuFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .theme-option {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 12px;
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

      .theme-option:focus-visible,
      .menu-item:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--brand) 40%, transparent);
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

      .user-profile:focus-visible {
        outline: none;
        border-radius: 10px;
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 38%, transparent);
      }

      .user-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 16px;
        background: color-mix(
          in srgb,
          var(--bg-secondary) 96%,
          var(--brand) 4%
        );
        backdrop-filter: blur(20px) saturate(1.2);
        -webkit-backdrop-filter: blur(20px) saturate(1.2);
        border: 1px solid color-mix(in srgb, var(--brand) 18%, var(--border-soft));
        border-radius: 14px;
        padding: 12px;
        min-width: 220px;
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);
        z-index: 5100;
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
        padding: 0 12px 120px; /* Increased bottom padding to prevent bots from covering content */
        max-width: 100%;
        margin: 0 auto;
      }

      /* Premium Status Badge */
      .premium-status {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid;
        border-radius: 100px;
        font-size: 0.58rem;
        font-weight: 900;
        letter-spacing: 0.1em;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
      }

      .premium-status lucide-icon {
        opacity: 0.8;
      }

      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 5px;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--border-medium);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }

      @media (prefers-reduced-motion: reduce) {
        .theme-menu {
          animation: none;
        }
        .icon-btn:hover,
        .theme-btn:hover {
          transform: none;
        }
        .user-profile:hover .avatar {
          transform: none;
        }
      }
    `,
  ],
})
export class AppLayoutComponent {
  readonly logoutClick = output<void>();
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly navEvents = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );
  /** Dominio IA según la ruta (Stage-Bot, Lens-Bot, JAIME, …). */
  readonly routeDomain = computed(() => {
    this.navEvents();
    return getAiFeatureFromUrl(this.router.url);
  });
  readonly currentTheme = this.themeService.currentTheme;
  readonly currentThemeData = this.themeService.currentThemeData;

  showThemeMenu = signal(false);

  @Input() tenantName = 'Josanz Audiovisuales S.L.';
  showNotifications = signal(false);
  showCommandPalette = signal(false);
  showUserMenu = signal(false);

  private readonly identityAuth = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);
  readonly aiBotStore = inject(AIBotStore);
  readonly mainAssistant = viewChild.required<UIAIChatComponent>('mainAssistant');
  readonly premiumExperience = computed(() => !this.pluginStore.highPerformanceMode());

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    }
  }

  toggleThemeMenu() {
    this.showThemeMenu.update((v) => !v);
  }

  toggleNotifications() {
    this.showNotifications.update((v) => !v);
  }

  toggleCommandPalette() {
    this.showCommandPalette.update((v) => !v);
  }

  closeCommandPalette() {
    this.showCommandPalette.set(false);
  }

  toggleUserMenu() {
    this.showUserMenu.update((v) => !v);
  }

  toggleAssistant() {
    this.mainAssistant().toggleChat();
  }

  logout() {
    this.identityAuth.logout();
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
    this.showThemeMenu.set(false);
  }
}
