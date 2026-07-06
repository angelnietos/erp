import { Route } from '@angular/router';
import { JosanzEquipmentListComponent } from './equipment-list/josanz-equipment-list';
import { JosanzEquipmentDetailComponent } from './equipment-detail/josanz-equipment-detail';

export const josanzEquipmentFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./equipment-list/josanz-equipment-list').then(
        (m) => m.JosanzEquipmentListComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./equipment-detail/josanz-equipment-detail').then((m) => m.JosanzEquipmentDetailComponent),
  },
];
