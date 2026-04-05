import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { NotFoundComponent } from './not-found.component';
import { pluginGuard } from '@josanz-erp/shared-data-access';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@josanz-erp/identity-shell').then((m) => m.identityRoutes),
  },
  {
    path: '',
    component: MainAppShellComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@josanz-erp/dashboard-feature').then(
            (m) => m.dashboardFeatureRoutes,
          ),
        canActivate: [pluginGuard('dashboard')],
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('@josanz-erp/projects-feature').then(
            (m) => m.projectsFeatureRoutes,
          ),
        canActivate: [pluginGuard('projects')],
      },
      {
        path: 'events',
        loadChildren: () =>
          import('@josanz-erp/events-shell').then(
            (m) => m.eventsShellRoutes,
          ),
        canActivate: [pluginGuard('events')],
      },
      {
        path: 'services',
        loadChildren: () =>
          import('@josanz-erp/services-shell').then(
            (m) => m.servicesShellRoutes,
          ),
        canActivate: [pluginGuard('services')],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('@josanz-erp/reports-shell').then(
            (m) => m.reportsShellRoutes,
          ),
        canActivate: [pluginGuard('reports')],
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('@josanz-erp/audit-shell').then((m) => m.auditShellRoutes),
        canActivate: [pluginGuard('audit')],
      },
      {
        path: 'receipts',
        loadChildren: () =>
          import('@josanz-erp/receipts-feature').then(
            (m) => m.receiptsFeatureRoutes,
          ),
        canActivate: [pluginGuard('receipts')],
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('@josanz-erp/budget-shell').then((m) => m.budgetRoutes),
        canActivate: [pluginGuard('budgets')],
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('@josanz-erp/inventory-shell').then(
            (m) => m.inventoryShellRoutes,
          ),
        canActivate: [pluginGuard('inventory')],
      },
      {
        path: 'delivery',
        loadChildren: () =>
          import('@josanz-erp/delivery-shell').then(
            (m) => m.deliveryShellRoutes,
          ),
        canActivate: [pluginGuard('delivery')],
      },
      {
        path: 'fleet',
        loadChildren: () =>
          import('@josanz-erp/fleet-shell').then((m) => m.fleetShellRoutes),
        canActivate: [pluginGuard('fleet')],
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('@josanz-erp/billing-shell').then((m) => m.billingShellRoutes),
        canActivate: [pluginGuard('billing')],
      },
      {
        path: 'verifactu',
        loadChildren: () =>
          import('@josanz-erp/verifactu-shell').then((m) => m.verifactuRoutes),
        canActivate: [pluginGuard('verifactu')],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('@josanz-erp/settings-shell').then((m) => m.settingsRoutes),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('@josanz-erp/identity-shell').then((m) => m.usersRoutes),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('@josanz-erp/clients-shell').then((m) => m.clientsShellRoutes),
        canActivate: [pluginGuard('clients')],
      },
      {
        path: 'rentals',
        loadChildren: () =>
          import('@josanz-erp/rentals-shell').then((m) => m.rentalsShellRoutes),
        canActivate: [pluginGuard('rentals')],
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
