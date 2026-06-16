import { Route } from '@angular/router';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';
import { InventoryEditComponent } from './inventory-edit/inventory-edit.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryListComponent },
  { path: 'new', component: InventoryEditComponent },
  { path: ':id/edit', component: InventoryEditComponent },
  { path: ':id', component: InventoryDetailComponent },
];

export * from './inventory-feature/inventory-feature';
