import { Route } from '@angular/router';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const inventoryFeatureRoutes: Route[] = [
  { path: '', component: InventoryListComponent },
  { path: ':id', component: DetailPlaceholderComponent },
];

export * from './inventory-list/inventory-list.component';
