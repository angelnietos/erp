import { Route } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

/**
 * Mismas rutas que apps/josanz-web-app (josanz-ui + shells josanz-*).
 * Se activan con canMatch cuando el tenant usa shell josanz-figma (josanz, alexis).
 */
export const josanzFigmaAppRoutes: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('@josanz-erp/josanz-figma-dashboard-inicio').then(
        (m) => m.JosanzDashboardInicioComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@josanz-erp/josanz-figma-settings').then(
        (m) => m.JosanzSettingsPlaceholderComponent,
      ),
  },
  {
    path: 'export',
    loadComponent: () =>
      import('@josanz-erp/josanz-figma-export-center').then(
        (m) => m.JosanzExportCenterComponent,
      ),
  },
  {
    path: 'reports/new',
    loadComponent: () =>
      import('@josanz-erp/josanz-figma-report-new').then(
        (m) => m.JosanzReportNewComponent,
      ),
  },
  {
    path: 'clients',
    loadChildren: () =>
      import('@josanz-erp/shell').then((m) => m.josanzClientsRoutes),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('@josanz-erp/josanz-users-shell').then((m) => m.josanzUsersRoutes),
  },
  {
    path: 'stock',
    loadChildren: () =>
      import('@josanz-erp/josanz-stock-shell').then((m) => m.josanzStockRoutes),
  },
  {
    path: 'budgets',
    loadChildren: () =>
      import('@josanz-erp/josanz-budgets-shell').then((m) => m.josanzBudgetsRoutes),
  },
  {
    path: 'events',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-shell').then((m) => m.josanzEventsRoutes),
  },
  {
    path: 'equipment',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-shell').then((m) => m.josanzEquipmentRoutes),
  },
  {
    path: 'vehicles',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-shell').then((m) => m.josanzVehiclesRoutes),
  },
  {
    path: 'staff',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-shell').then((m) => m.josanzStaffRoutes),
  },
  {
    path: 'billing',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-shell').then((m) => m.josanzBillingRoutes),
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'Página no encontrada',
  },
];
