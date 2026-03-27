import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('@josanz-erp/identity-shell').then(m => m.identityRoutes),
  },
  {
    path: 'login',
    loadComponent: () => import('@josanz-erp/identity-feature').then((m) => m.LoginComponent),
  },
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
    loadChildren: () => import('@josanz-erp/inventory-shell').then((m) => m.inventoryRoutes),
  },
  {
    path: 'delivery',
    loadChildren: () => import('@josanz-erp/delivery-shell').then((m) => m.deliveryRoutes),
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
    path: 'users',
    loadChildren: () => import('@josanz-erp/identity-shell').then((m) => m.identityRoutes),
  },
  {
    path: 'verifactu',
    loadChildren: () => import('@josanz-erp/verifactu-shell').then((m) => m.verifactuRoutes),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
