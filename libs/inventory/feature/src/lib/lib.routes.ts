import { Route } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryListComponent },
  { path: ':id', loadComponent: () => import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent) },
];

export * from './inventory-list/inventory-list.component';
