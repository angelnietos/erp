import { Route } from '@angular/router';
import { MainAppShellComponent } from './main-app-shell.component';
import { NotFoundComponent } from './not-found.component';
import { pluginGuard, usersShellGuard, permissionGuard } from '@josanz-erp/shared-data-access';

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
          import('@josanz-erp/projects-shell').then(
            (m) => m.projectsShellRoutes,
          ),
        canActivate: [pluginGuard('projects'), permissionGuard('projects.view')],
      },
      {
        path: 'events',
        loadChildren: () =>
          import('@josanz-erp/events-shell').then(
            (m) => m.eventsShellRoutes,
          ),
        canActivate: [pluginGuard('events'), permissionGuard('events.view')],
      },
      {
        path: 'services',
        loadChildren: () =>
          import('@josanz-erp/services-shell').then(
            (m) => m.servicesShellRoutes,
          ),
        canActivate: [pluginGuard('services'), permissionGuard('services.view')],
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('@josanz-erp/reports-shell').then(
            (m) => m.reportsShellRoutes,
          ),
        canActivate: [pluginGuard('reports'), permissionGuard('reports.view')],
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('@josanz-erp/audit-shell').then((m) => m.auditShellRoutes),
        canActivate: [pluginGuard('audit'), permissionGuard('audit.view')],
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
        canActivate: [pluginGuard('budgets'), permissionGuard('budgets.view')],
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('@josanz-erp/inventory-shell').then(
            (m) => m.inventoryShellRoutes,
          ),
        canActivate: [pluginGuard('inventory'), permissionGuard('inventory.view')],
      },
      {
        path: 'delivery',
        loadChildren: () =>
          import('@josanz-erp/delivery-shell').then(
            (m) => m.deliveryShellRoutes,
          ),
        canActivate: [pluginGuard('delivery'), permissionGuard('delivery.view')],
      },
      {
        path: 'fleet',
        loadChildren: () =>
          import('@josanz-erp/fleet-shell').then((m) => m.fleetShellRoutes),
        canActivate: [pluginGuard('fleet'), permissionGuard('fleet.view')],
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('@josanz-erp/billing-shell').then((m) => m.billingShellRoutes),
        canActivate: [pluginGuard('billing'), permissionGuard('billing.view')],
      },
      {
        path: 'verifactu',
        loadChildren: () =>
          import('@josanz-erp/verifactu-shell').then((m) => m.verifactuRoutes),
        canActivate: [pluginGuard('verifactu'), permissionGuard('verifactu.view')],
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
        canActivate: [usersShellGuard],
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('@josanz-erp/clients-shell').then((m) => m.clientsShellRoutes),
        canActivate: [pluginGuard('clients'), permissionGuard('clients.view')],
      },
      {
        path: 'rentals',
        loadChildren: () =>
          import('@josanz-erp/rentals-shell').then((m) => m.rentalsShellRoutes),
        canActivate: [pluginGuard('rentals'), permissionGuard('rentals.view')],
      },
      {
        path: 'ai-insights',
        loadComponent: () =>
          import('@josanz-erp/ai-insights-feature').then((m) => m.AiInsightsComponent),
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
