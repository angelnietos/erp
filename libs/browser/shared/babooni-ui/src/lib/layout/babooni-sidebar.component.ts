import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PluginStore } from '@josanz-erp/shared-data-access';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { ERP_MAIN_NAV_ITEMS } from '@josanz-erp/shared-ui-shell';

@Component({
  selector: 'babooni-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <aside class="bb-sidebar" [class.collapsed]="isCollapsed()">
      <div class="bb-sidebar__header">
        @if (!isCollapsed()) {
          <div class="bb-sidebar__brand">
            <span class="bb-sidebar__mark"></span>
            <span class="bb-sidebar__title">Babooni</span>
          </div>
        }
        <button
          type="button"
          class="bb-sidebar__toggle"
          (click)="toggle()"
          [attr.aria-label]="isCollapsed() ? 'Expandir menú' : 'Contraer menú'"
        >
          <lucide-icon
            [name]="isCollapsed() ? 'chevron-right' : 'chevron-left'"
            size="16"
          />
        </button>
      </div>

      <nav class="bb-sidebar__nav" aria-label="Navegación principal">
        <ul class="bb-sidebar__list">
          @for (item of filteredNavItems(); track item.id) {
            <li>
              <a
                [routerLink]="item.route"
                [routerLinkActiveOptions]="{ exact: item.route === '/' }"
                routerLinkActive="is-active"
                class="bb-nav-link"
                [attr.title]="item.label"
              >
                <span class="bb-nav-link__icon">
                  <lucide-icon [name]="item.icon" size="18" />
                </span>
                @if (!isCollapsed()) {
                  <span class="bb-nav-link__label">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="bb-sidebar__footer">
        <ul class="bb-sidebar__list">
          <li>
            <a
              routerLink="/settings"
              routerLinkActive="is-active"
              class="bb-nav-link"
              [attr.title]="'Configuración'"
            >
              <span class="bb-nav-link__icon">
                <lucide-icon name="cog" size="18" />
              </span>
              @if (!isCollapsed()) {
                <span class="bb-nav-link__label">Configuración</span>
              }
            </a>
          </li>
          <li>
            <button type="button" class="bb-nav-link bb-nav-link--btn" (click)="logout()">
              <span class="bb-nav-link__icon">
                <lucide-icon name="log-out" size="18" />
              </span>
              @if (!isCollapsed()) {
                <span class="bb-nav-link__label">Cerrar sesión</span>
              }
            </button>
          </li>
        </ul>
      </div>
    </aside>
  `,
  styleUrl: './babooni-sidebar.component.css',
})
export class BabooniSidebarComponent {
  private readonly identityAuth = inject(AuthStore);
  private readonly pluginStore = inject(PluginStore);

  private readonly navItems = ERP_MAIN_NAV_ITEMS;

  readonly filteredNavItems = computed(() =>
    this.navItems.filter((item) => {
      if (
        item.id !== 'dashboard' &&
        item.id !== 'ai-insights' &&
        !this.pluginStore.enabledPlugins().includes(item.id || '')
      ) {
        return false;
      }
      return true;
    }),
  );

  readonly isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.update((v) => !v);
  }

  logout(): void {
    this.identityAuth.logout();
  }
}
