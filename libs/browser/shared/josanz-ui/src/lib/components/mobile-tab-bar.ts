import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { JOSANZ_FIGMA_APP } from '../theme/josanz-figma-tokens';

export interface JosanzMobileTabItem {
  path: string;
  label: string;
  /** `routerLinkActive` con coincidencia exacta (p. ej. `/dashboard`). */
  exact?: boolean;
  /** Tab central destacado (CTA informe). */
  prominent?: boolean;
}

@Component({
  selector: 'josanz-mobile-tab-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-tab-bar.html',
  styleUrl: './mobile-tab-bar.css',
})
export class MobileTabBarComponent {
  readonly theme = inject(JosanzThemeService);
  readonly app = JOSANZ_FIGMA_APP;

  readonly tabs: JosanzMobileTabItem[] = [
    { path: '/dashboard', label: 'Inicio', exact: true },
    { path: '/clients', label: 'Clientes' },
    { path: '/reports/new', label: 'Informe', prominent: true },
    { path: '/budgets', label: 'Presup.' },
    { path: '/settings', label: 'Ajustes' },
  ];
}
