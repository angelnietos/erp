import { Route } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';

export const clientsFeatureRoutes: Route[] = [
  { path: '', component: ClientsListComponent },
  { path: ':id', loadComponent: () => import('./clients-detail/clients-detail.component').then(m => m.ClientsDetailComponent) },
];

export * from './clients-list/clients-list.component';
