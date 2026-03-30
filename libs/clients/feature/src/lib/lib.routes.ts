import { Route } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';

export const clientsFeatureRoutes: Route[] = [
  { path: '', component: ClientsListComponent },
  { path: ':id', loadComponent: () => import('@josanz-erp/shared-ui-kit').then(m => m.DetailPlaceholderComponent) },
];

export * from './clients-list/clients-list.component';
