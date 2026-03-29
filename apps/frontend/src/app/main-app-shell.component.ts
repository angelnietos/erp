import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from '@josanz-erp/shared-ui-shell';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { NavMenuItem } from '@josanz-erp/shared-ui-kit';

@Component({
  selector: 'app-main-app-shell',
  standalone: true,
  imports: [RouterModule, AppLayoutComponent],
  template: `
    <josanz-app-layout [navItems]="navItems" (logoutClick)="auth.logout()">
      <router-outlet></router-outlet>
    </josanz-app-layout>
  `,
})
export class MainAppShellComponent {
  readonly auth = inject(AuthStore);

  readonly navItems: NavMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/' },
    { id: 'clients', label: 'Clientes', icon: 'users', route: '/clients' },
    { id: 'inventory', label: 'Inventario', icon: 'package', route: '/inventory' },
    { id: 'budgets', label: 'Presupuestos', icon: 'receipt', route: '/budgets' },
    { id: 'delivery', label: 'Albaranes', icon: 'truck', route: '/delivery' },
    { id: 'fleet', label: 'Flota', icon: 'car', route: '/fleet' },
    { id: 'rentals', label: 'Alquileres', icon: 'key', route: '/rentals' },
    { id: 'billing', label: 'Facturación', icon: 'history', route: '/billing' },
  ];
}
