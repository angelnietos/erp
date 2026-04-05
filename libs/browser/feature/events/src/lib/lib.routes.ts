import { Route } from '@angular/router';

export const eventsFeatureRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/events-list.component').then(
        (m) => m.EventsListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/new-event.component').then(
        (m) => m.NewEventComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/events-list.component').then(
        (m) => m.EventsListComponent,
      ),
  },
];
