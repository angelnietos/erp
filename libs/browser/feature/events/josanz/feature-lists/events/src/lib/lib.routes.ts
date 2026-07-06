import { Route } from '@angular/router';
import { JosanzEventsFeatureListComponent } from './events-feature-list/josanz-events-feature-list';
import { JosanzEventCreateComponent } from './event-create/josanz-event-create';
import { JosanzEventDetailComponent } from './event-detail/josanz-event-detail';

export const josanzEventsFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./events-feature-list/josanz-events-feature-list').then(
        (m) => m.JosanzEventsFeatureListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./event-create/josanz-event-create').then((m) => m.JosanzEventCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./event-detail/josanz-event-detail').then((m) => m.JosanzEventDetailComponent),
  },
];
