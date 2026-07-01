import { Route } from '@angular/router';

export const josanzEventsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./josanz-events-feature-list/josanz-events-feature-list').then(
        (m) => m.JosanzEventsFeatureListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./josanz-event-create/josanz-event-create').then((m) => m.JosanzEventCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./josanz-event-edit/josanz-event-edit').then((m) => m.JosanzEventEditComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./josanz-event-detail/josanz-event-detail').then((m) => m.JosanzEventDetailComponent),
  },
];

export const josanzAudiovisualRoutes: Route[] = [
  {
    path: 'equipment',
    loadComponent: () =>
      import('./josanz-equipment-list/josanz-equipment-list').then((m) => m.JosanzEquipmentListComponent),
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./josanz-vehicles-list/josanz-vehicles-list').then((m) => m.JosanzVehiclesListComponent),
  },
  {
    path: 'staff',
    loadComponent: () =>
      import('./josanz-staff-list/josanz-staff-list').then((m) => m.JosanzStaffListComponent),
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('./josanz-billing-list/josanz-billing-list').then((m) => m.JosanzBillingListComponent),
  },
];
