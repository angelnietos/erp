import { Route } from '@angular/router';
import { josanzFigmaAccessGuard, josanzSettingsAccessGuard } from '@josanz-erp/shared-data-access';
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
        canActivate: [josanzFigmaAccessGuard('dashboard')],
        loadComponent: () =>
          import('./pages/josanz-dashboard-inicio.component').then(
            (m) => m.JosanzDashboardInicioComponent,
          ),
      },
      {
        path: 'settings',
        canActivate: [josanzSettingsAccessGuard],
        loadComponent: () =>
          import('./pages/josanz-settings-placeholder.component').then(
            (m) => m.JosanzSettingsPlaceholderComponent,
          ),
      },
      {
        path: 'export',
        canActivate: [josanzFigmaAccessGuard('reports', 'reports.view')],
        loadComponent: () =>
          import('./pages/josanz-export-center.component').then(
            (m) => m.JosanzExportCenterComponent,
          ),
      },
      {
        path: 'reports/new',
        canActivate: [josanzFigmaAccessGuard('reports', 'reports.view')],
        loadComponent: () =>
          import('./pages/josanz-report-new.component').then(
            (m) => m.JosanzReportNewComponent,
          ),
      },
      {
        path: 'clients',
        canActivate: [josanzFigmaAccessGuard('clients', 'clients.view')],
        loadChildren: () =>
          import('@josanz-erp/shell').then((m) => m.josanzClientsRoutes),
      },
      {
        path: 'users',
        canActivate: [josanzFigmaAccessGuard('identity', 'users.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-users-shell').then(
            (m) => m.josanzUsersRoutes,
          ),
      },
      {
        path: 'stock',
        canActivate: [josanzFigmaAccessGuard('inventory', 'products.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-stock-shell').then(
            (m) => m.josanzStockRoutes,
          ),
      },
      {
        path: 'budgets',
        canActivate: [josanzFigmaAccessGuard('budgets', 'budgets.view')],
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
        canActivate: [josanzFigmaAccessGuard('events', 'events.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-events-shell').then((m) => m.josanzEventsRoutes),
      },
      {
        path: 'equipment',
        canActivate: [josanzFigmaAccessGuard('inventory', 'products.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-events-shell').then((m) => m.josanzEquipmentRoutes),
      },
      {
        path: 'vehicles',
        canActivate: [josanzFigmaAccessGuard('fleet', 'fleet.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-events-shell').then((m) => m.josanzVehiclesRoutes),
      },
      {
        path: 'staff',
        canActivate: [josanzFigmaAccessGuard('identity', 'users.view')],
        loadChildren: () =>
          import('@josanz-erp/josanz-events-shell').then((m) => m.josanzStaffRoutes),
      },
      {
        path: 'billing',
        canActivate: [josanzFigmaAccessGuard('billing', 'billing.view')],
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
