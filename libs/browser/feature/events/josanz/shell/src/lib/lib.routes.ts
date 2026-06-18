import { Route } from '@angular/router';

export const josanzEventsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzEventsFeatureListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzEventCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzEventDetailComponent),
  },
];

export const josanzEquipmentRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzEquipmentListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzFigmaCreatePageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzEquipmentDetailComponent),
  },
];

export const josanzVehiclesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzVehiclesListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzFigmaCreatePageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzVehiclesDetailComponent),
  },
];

export const josanzStaffRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzStaffListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzFigmaCreatePageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzStaffDetailComponent),
  },
];

export const josanzBillingRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzBillingListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then(
        (m) => m.JosanzFigmaCreatePageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-events-feature-list').then((m) => m.JosanzBillingDetailComponent),
  },
];
