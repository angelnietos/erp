import { Route } from '@angular/router';
import { JosanzVehiclesListComponent } from './vehicles-list/josanz-vehicles-list';
import { JosanzVehiclesDetailComponent } from './vehicles-detail/josanz-vehicles-detail';

export const josanzVehiclesFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./vehicles-list/josanz-vehicles-list').then(
        (m) => m.JosanzVehiclesListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./vehicles-detail/josanz-vehicles-detail').then((m) => m.JosanzVehiclesDetailComponent),
  },
];
