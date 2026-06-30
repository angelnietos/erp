import { Route } from '@angular/router';
import { josanzAuthGuard, josanzGuestGuard } from './auth/josanz-auth.guard';
import { JosanzAppShellComponent } from './josanz-app-shell.component';

export const appRoutes: Route[] = [
  {
    path: 'auth/login',
    canActivate: [josanzGuestGuard],
    loadComponent: () =>
      import('./pages/josanz-login.component').then(
        (m) => m.JosanzLoginComponent,
      ),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./pages/josanz-forgot-password.component').then((m) => m.JosanzForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('@josanz-erp/identity-feature').then((m) => m.ResetPasswordComponent),
  },
  {
    path: '',
    component: JosanzAppShellComponent,
    canActivate: [josanzAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/josanz-dashboard-inicio.component').then(
            (m) => m.JosanzDashboardInicioComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/josanz-settings-placeholder.component').then(
            (m) => m.JosanzSettingsPlaceholderComponent,
          ),
      },
      {
        path: 'export',
        loadComponent: () =>
          import('./pages/josanz-export-center.component').then(
            (m) => m.JosanzExportCenterComponent,
          ),
      },
      {
        path: 'reports/new',
        loadComponent: () =>
          import('./pages/josanz-report-new.component').then(
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
          import('@josanz-erp/josanz-users-shell').then(
            (m) => m.josanzUsersRoutes,
          ),
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('@josanz-erp/josanz-stock-shell').then(
            (m) => m.josanzStockRoutes,
          ),
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('@josanz-erp/josanz-budgets-shell').then((m) => m.josanzBudgetsRoutes),
      },
      // TODO: josanz-delivery-notes-shell - uncomment when generated
      // {
      //   path: 'delivery-notes',
      //   loadChildren: () =>
      //     import('@josanz-erp/josanz-delivery-notes-shell').then((m) => m.josanzDeliveryNotesRoutes),
      // },
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
    ],
  },
  {
    path: '**',
    redirectTo: 'events',
  },
];
