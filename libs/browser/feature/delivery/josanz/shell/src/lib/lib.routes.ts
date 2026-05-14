import { Route } from '@angular/router';

export const josanzDeliveryNotesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-delivery-notes-feature-list').then(
        (m) => m.JosanzDeliveryNotesFeatureListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-delivery-notes-feature-list').then(
        (m) => m.JosanzDeliveryNoteCreateComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-delivery-notes-feature-list').then(
        (m) => m.JosanzDeliveryNoteDetailComponent
      ),
  },
];
