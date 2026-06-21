import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { JOSANZ_FIGMA_APP } from '../theme/josanz-figma-tokens';
import { JosanzSidebarIconComponent } from './sidebar-icon.component';
import type { JosanzSidebarIconKey } from './sidebar';

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

  readonly tabs: JosanzMobileTabItem[] = [
    { path: '/dashboard', label: 'Inicio', exact: true, icon: 'inicio' },
    { path: '/events', label: 'Eventos', icon: 'eventos' },
    { path: '/stock', label: 'Stock', icon: 'stock' },
    { path: '/reports/new', label: 'Informe', prominent: true },
    { path: '/budgets', label: 'Presup.', icon: 'presupuestos' },
    { path: '/clients', label: 'Clientes', icon: 'clientes' },
    { path: '/settings', label: 'Ajustes', icon: 'ajustes' },
  ];
}
