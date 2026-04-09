import { Route } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsDetailComponent } from './clients-detail/clients-detail.component';

export const clientsFeatureRoutes: Route[] = [
  { path: '', component: ClientsListComponent },
  { path: ':id', component: ClientsDetailComponent },
  { path: ':id/edit', component: ClientsDetailComponent },
];

export * from './clients-list/clients-list.component';
