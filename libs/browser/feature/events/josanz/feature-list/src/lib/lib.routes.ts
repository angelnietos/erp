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
    path: ':id',
    loadComponent: () =>
      import('./josanz-event-detail/josanz-event-detail').then((m) => m.JosanzEventDetailComponent),
  },
];
