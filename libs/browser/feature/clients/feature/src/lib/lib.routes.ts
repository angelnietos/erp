import { Route } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsDetailComponent } from './clients-detail/clients-detail.component';
import { ClientsEditComponent } from './clients-edit/clients-edit.component';

export const clientsFeatureRoutes: Route[] = [
  { path: '', component: ClientsListComponent },
  { path: 'new', component: ClientsEditComponent },
  { path: ':id', component: ClientsDetailComponent },
  { path: ':id/edit', component: ClientsEditComponent },
];

export * from './clients-list/clients-list.component';
