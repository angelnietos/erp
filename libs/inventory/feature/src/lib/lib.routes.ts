import { Route } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryListComponent },
];

export * from './inventory-list/inventory-list.component';
