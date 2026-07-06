import { Route } from '@angular/router';
import { JosanzStaffListComponent } from './staff-list/josanz-staff-list';
import { JosanzStaffDetailComponent } from './staff-detail/josanz-staff-detail';

export const josanzStaffFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./staff-list/josanz-staff-list').then(
        (m) => m.JosanzStaffListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./staff-detail/josanz-staff-detail').then((m) => m.JosanzStaffDetailComponent),
  },
];
