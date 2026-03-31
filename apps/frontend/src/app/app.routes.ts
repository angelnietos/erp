import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { DashboardComponent } from '@josanz-erp/shared-ui-shell';
import { pluginGuard } from '@josanz-erp/shared-data-access';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('@josanz-erp/identity-shell').then(m => m.identityRoutes),
  },
  {
    path: '',
    component: MainAppShellComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [pluginGuard('dashboard')],
      },
      {
        path: 'clients',
        loadChildren: () => import('@josanz-erp/clients-shell').then((m) => m.clientsShellRoutes),
        canActivate: [pluginGuard('clients')],
      },
      {
        path: 'budgets',
        loadChildren: () => import('@josanz-erp/budget-shell').then((m) => m.budgetRoutes),
        canActivate: [pluginGuard('budgets')],
      },
      {
        path: 'inventory',
        loadChildren: () => import('@josanz-erp/inventory-shell').then((m) => m.inventoryShellRoutes),
        canActivate: [pluginGuard('inventory')],
      },
      {
        path: 'delivery',
        loadChildren: () => import('@josanz-erp/delivery-shell').then((m) => m.deliveryShellRoutes),
        canActivate: [pluginGuard('delivery')],
      },
      {
        path: 'fleet',
        loadChildren: () => import('@josanz-erp/fleet-shell').then((m) => m.fleetShellRoutes),
        canActivate: [pluginGuard('fleet')],
      },
      {
        path: 'billing',
        loadChildren: () => import('@josanz-erp/billing-shell').then((m) => m.billingShellRoutes),
        canActivate: [pluginGuard('billing')],
      },
      {
        path: 'rentals',
        loadChildren: () => import('@josanz-erp/rentals-shell').then((m) => m.rentalsShellRoutes),
        canActivate: [pluginGuard('rentals')],
      },
      {
        path: 'verifactu',
        loadChildren: () => import('@josanz-erp/verifactu-shell').then((m) => m.verifactuRoutes),
        canActivate: [pluginGuard('verifactu')],
      },
      {
        path: 'settings',
        loadChildren: () => import('@josanz-erp/settings-shell').then((m) => m.settingsRoutes),
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
