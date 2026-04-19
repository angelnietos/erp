import {
  Component,
  HostListener,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import {
  ThemeService,
  Theme,
  PluginStore,
  AIBotStore,
  getAiFeatureFromUrl,
} from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import {
  NotificationDrawerComponent,
  CommandPaletteComponent,
  ToastStackComponent,
} from '@josanz-erp/shared-ui-shell';
import { UIAIChatComponent } from '@josanz-erp/shared-ui-kit';
import { BabooniSidebarComponent } from './babooni-sidebar.component';

@Component({
  selector: 'lib-babooni-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    BabooniSidebarComponent,
    NotificationDrawerComponent,
    CommandPaletteComponent,
    ToastStackComponent,
    UIAIChatComponent,
  ],
  template: `
    <josanz-toast-stack />
    <div class="bb-shell">
      <lib-babooni-sidebar />

      <div class="bb-shell__main">
        <header class="bb-topbar">
          <div class="bb-search">
            <div
              class="bb-search__box"
              (click)="toggleCommandPalette()"
              (keydown.enter)="toggleCommandPalette()"
              tabindex="0"
              role="button"
              aria-label="Abrir paleta de comandos"
            >
              <lucide-icon name="search" size="18" aria-hidden="true" />
              <input type="text" placeholder="Buscar…" readonly />
              <span class="bb-search__kbd">⌘K</span>
            </div>
          </div>

          <div class="bb-actions">
            @if (tenantName) {
              <div class="bb-badge">
                <lucide-icon name="building-2" size="16" aria-hidden="true" />
                <span>{{ tenantName }}</span>
              </div>
            }

            <button
              type="button"
              class="bb-icon-btn"
              (click)="toggleNotifications()"
              aria-label="Notificaciones"
            >
              <lucide-icon name="bell" size="20" aria-hidden="true" />
              <span class="bb-dot" aria-hidden="true"></span>
            </button>

            @if (premiumExperience()) {
              <div
                class="bb-premium animate-fade-in"
                [style.color]="currentThemeData().primary"
                [style.border-color]="currentThemeData().primary + '44'"
              >
                <lucide-icon name="sparkles" size="14" aria-hidden="true" />
                <span>LUXE</span>
              </div>
            }

            <div class="bb-theme-wrap">
              <button
                type="button"
                class="bb-icon-btn"
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
                />
              </button>
              @if (showThemeMenu()) {
                <div class="bb-theme-menu" role="listbox" aria-label="Elegir tema visual">
                  @for (section of themeService.themeMenuSections; track section.id) {
                    <div class="bb-theme-section" role="group" [attr.aria-label]="section.label">
                      <div class="bb-theme-section-label">{{ section.label }}</div>
                      @for (themeKey of section.keys; track themeKey) {
                        <button
                          type="button"
                          class="bb-theme-option"
                          [class.is-active]="currentTheme() === themeKey"
                          role="option"
                          [attr.aria-selected]="currentTheme() === themeKey"
                          (click)="setTheme(themeKey)"
                        >
                          <span
                            class="bb-theme-swatch"
                            [style.background]="themeService.themes[themeKey].primary"
                          ></span>
                          <span>{{ themeService.themes[themeKey].name }}</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <div
              class="bb-user"
              (click)="toggleUserMenu()"
              (keydown.enter)="toggleUserMenu()"
              tabindex="0"
              role="button"
              aria-label="Menú de usuario"
            >
              <div class="bb-user__meta">
                <span class="bb-user__name">{{ userDisplayName() }}</span>
                <span class="bb-user__role">{{ userRoleLabel() }}</span>
              </div>
              <div class="bb-avatar">
                <lucide-icon name="user" size="18" aria-hidden="true" />
              </div>

              @if (showUserMenu()) {
                <div class="bb-user-menu animate-fade-in">
                  <button type="button" class="bb-user-menu__row" routerLink="/settings">
                    <lucide-icon name="settings" size="16" aria-hidden="true" />
                    Configuración
                  </button>
                  <button type="button" class="bb-user-menu__row bb-user-menu__row--danger" (click)="logout()">
                    <lucide-icon name="log-out" size="16" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        @if (showNotifications()) {
          <josanz-notification-drawer (closeDrawer)="toggleNotifications()" />
        }

        @if (showCommandPalette()) {
          <josanz-command-palette (closePalette)="closeCommandPalette()" />
        }

        <main class="bb-scroll">
          <div class="bb-content">
            <router-outlet />
          </div>
        </main>

        <ui-ai-assistant
          [feature]="aiBotStore.activeBotFeature()"
          assistantRole="buddy"
        />
        @if (routeDomain() !== aiBotStore.activeBotFeature()) {
          <ui-ai-assistant [feature]="routeDomain()" assistantRole="domain" />
        }
      </div>
    </div>
  `,
  styleUrl: './babooni-app-layout.component.css',
})
export class BabooniAppLayoutComponent {
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly navEvents = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  readonly routeDomain = computed(() => {
    this.navEvents();
    return getAiFeatureFromUrl(this.router.url);
  });

  readonly currentTheme = this.themeService.currentTheme;
  readonly currentThemeData = this.themeService.currentThemeData;

  readonly showThemeMenu = signal(false);
  readonly showNotifications = signal(false);
  readonly showCommandPalette = signal(false);
  readonly showUserMenu = signal(false);

  @Input() tenantName = 'Babooni';

  private readonly identityAuth = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);
  readonly aiBotStore = inject(AIBotStore);
  readonly premiumExperience = computed(() => !this.pluginStore.highPerformanceMode());

  readonly userDisplayName = computed(() => {
    const u = this.identityAuth.user();
    if (!u) {
      return '';
    }
    const n = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return n || u.email;
  });

  readonly userRoleLabel = computed(() => {
    const u = this.identityAuth.user();
    return u?.roles?.[0] ?? 'Usuario';
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    }
  }

  toggleThemeMenu(): void {
    this.showThemeMenu.update((v) => !v);
  }

  toggleNotifications(): void {
    this.showNotifications.update((v) => !v);
  }

  toggleCommandPalette(): void {
    this.showCommandPalette.update((v) => !v);
  }

  closeCommandPalette(): void {
    this.showCommandPalette.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update((v) => !v);
  }

  logout(): void {
    this.identityAuth.logout();
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.showThemeMenu.set(false);
  }
}
