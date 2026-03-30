import { Route } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const clientsFeatureRoutes: Route[] = [
  { path: '', component: ClientsListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export * from './clients-list/clients-list.component';
