import { Route } from '@angular/router';
import { InventoryFeature } from './inventory-feature/inventory-feature';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryFeature },
  { path: 'new', component: InventoryFeature },
  { path: ':id', component: InventoryFeature },
];

export * from './inventory-feature/inventory-feature';