import { Route } from '@angular/router';

export const josanzDeliveryNotesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./josanz-delivery-notes-feature-list/josanz-delivery-notes-feature-list').then(
        (m) => m.JosanzDeliveryNotesFeatureListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./josanz-delivery-note-create/josanz-delivery-note-create').then(
        (m) => m.JosanzDeliveryNoteCreateComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./josanz-delivery-note-detail/josanz-delivery-note-detail').then(
        (m) => m.JosanzDeliveryNoteDetailComponent
      ),
  },
];
