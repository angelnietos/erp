import { Route } from '@angular/router';

export const rentalsShellRoutes: Route[] = [
  { 
    path: '', 
    loadComponent: () => import('@josanz-erp/rentals-feature').then(m => m.RentalsListComponent) 
  },
  { 
    path: ':id', 
    loadComponent: () => import('@josanz-erp/rentals-feature').then(m => m.RentalsDetailComponent) 
  },
];
