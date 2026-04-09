import { Route } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryListComponent },
  { path: ':id', component: InventoryDetailComponent },
  { path: ':id/edit', component: InventoryDetailComponent },
];

export * from './inventory-list/inventory-list.component';
