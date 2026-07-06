import { Route } from '@angular/router';
import { JosanzCatalogListComponent } from './catalog/josanz-catalog-list';

export const josanzCatalogFeatureListRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./catalog/josanz-catalog-list').then(
        (m) => m.JosanzCatalogListComponent,
      ),
  },
];
