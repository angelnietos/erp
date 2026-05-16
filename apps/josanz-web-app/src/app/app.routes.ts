import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/josanz-dashboard-inicio.component').then((m) => m.JosanzDashboardInicioComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/josanz-settings-placeholder.component').then((m) => m.JosanzSettingsPlaceholderComponent),
  },
  {
    path: 'export',
    loadComponent: () =>
      import('./pages/josanz-export-center.component').then((m) => m.JosanzExportCenterComponent),
  },
  {
    path: 'reports/new',
    loadComponent: () =>
      import('./pages/josanz-report-new.component').then((m) => m.JosanzReportNewComponent),
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
      import('@josanz-erp/josanz-budgets-feature-list').then((m) => m.josanzBudgetsRoutes),
  },
  {
    path: 'delivery-notes',
    loadChildren: () =>
      import('@josanz-erp/josanz-delivery-notes-feature-list').then((m) => m.josanzDeliveryNotesRoutes),
  },
  {
    path: 'events',
    loadChildren: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.josanzEventsRoutes),
  },
  {
    path: 'equipment',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzEquipmentListComponent),
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzVehiclesListComponent),
  },
  {
    path: 'staff',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzStaffListComponent),
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzBillingListComponent),
  },
];
