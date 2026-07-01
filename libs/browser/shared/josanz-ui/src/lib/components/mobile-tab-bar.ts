import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { JOSANZ_FIGMA_APP } from '../theme/josanz-figma-tokens';
import { JosanzSidebarIconComponent } from './sidebar-icon.component';
import type { JosanzSidebarIconKey } from './sidebar';
import { GlobalAuthStore, PluginStore } from '@josanz-erp/shared-data-access';
import {
  canAccessJosanzSettings,
} from '../navigation/josanz-figma-nav';

export type JosanzMobileTabIconKey = Extract<
  JosanzSidebarIconKey,
  'inicio' | 'eventos' | 'clientes' | 'stock' | 'presupuestos' | 'ajustes'
>;

export interface JosanzMobileTabItem {
  path: string;
  label: string;
  /** `routerLinkActive` con coincidencia exacta (p. ej. `/dashboard`). */
  exact?: boolean;
  /** Tab central destacado (CTA informe). */
  prominent?: boolean;
  icon?: JosanzMobileTabIconKey;
  moduleId?: string;
  permission?: string;
  settingsOnly?: boolean;
}

@Component({
  selector: 'josanz-mobile-tab-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, JosanzSidebarIconComponent],
  templateUrl: './mobile-tab-bar.html',
  styleUrl: './mobile-tab-bar.css',
})
export class MobileTabBarComponent {
  readonly theme = inject(JosanzThemeService);
  readonly app = JOSANZ_FIGMA_APP;
  private readonly globalAuth = inject(GlobalAuthStore);
  private readonly pluginStore = inject(PluginStore);

  private readonly allTabs: JosanzMobileTabItem[] = [
    { path: '/dashboard', label: 'Inicio', exact: true, icon: 'inicio', moduleId: 'dashboard' },
    {
      path: '/events',
      label: 'Eventos',
      icon: 'eventos',
      moduleId: 'events',
      permission: 'events.view',
    },
    {
      path: '/stock',
      label: 'Stock',
      icon: 'stock',
      moduleId: 'inventory',
      permission: 'products.view',
    },
    {
      path: '/reports/new',
      label: 'Informe',
      prominent: true,
      moduleId: 'reports',
      permission: 'reports.view',
    },
    {
      path: '/budgets',
      label: 'Presup.',
      icon: 'presupuestos',
      moduleId: 'budgets',
      permission: 'budgets.view',
    },
    {
      path: '/clients',
      label: 'Clientes',
      icon: 'clientes',
      moduleId: 'clients',
      permission: 'clients.view',
    },
    {
      path: '/settings',
      label: 'Ajustes',
      icon: 'ajustes',
      settingsOnly: true,
    },
  ];

  readonly tabs = computed(() => {
    const permissions = this.globalAuth.permissions();
    const modules = this.pluginStore.enabledPlugins();

    return this.allTabs.filter((tab) => {
      if (tab.settingsOnly) {
        return canAccessJosanzSettings(permissions);
      }
      if (tab.moduleId && !modules.includes(tab.moduleId)) {
        return false;
      }
      if (!tab.permission) {
        return true;
      }
      return permissions.includes('*') || permissions.includes(tab.permission);
    });
  });
}
