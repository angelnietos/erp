import { Route } from '@angular/router';
import { MainShellComponent } from '@josanz-erp/shared-ui-shell';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'budgets',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('@josanz-erp/identity-shell').then(m => m.identityRoutes),
  },
  {
    path: '',
    component: MainShellComponent,
    children: [
      {
        path: 'clients',
        loadChildren: () => import('@josanz-erp/clients-shell').then((m) => m.clientsShellRoutes),
      },
      {
        path: 'budgets',
        loadChildren: () => import('@josanz-erp/budget-shell').then((m) => m.budgetRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () => import('@josanz-erp/inventory-shell').then((m) => m.inventoryShellRoutes),
      },
      {
        path: 'delivery',
        loadChildren: () => import('@josanz-erp/delivery-shell').then((m) => m.deliveryShellRoutes),
      },
      {
        path: 'fleet',
        loadChildren: () => import('@josanz-erp/fleet-shell').then((m) => m.fleetShellRoutes),
      },
      {
        path: 'billing',
        loadChildren: () => import('@josanz-erp/billing-shell').then((m) => m.billingShellRoutes),
      },
      {
        path: 'verifactu',
        loadChildren: () => import('@josanz-erp/verifactu-shell').then((m) => m.verifactuRoutes),
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
