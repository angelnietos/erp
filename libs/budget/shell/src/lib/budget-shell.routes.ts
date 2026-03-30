import { Route } from '@angular/router';
import { DetailPlaceholderComponent } from '@josanz-erp/shared-ui-kit';

export const budgetRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetListComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetCreateComponent),
  },
  {
    path: ':id',
    component: DetailPlaceholderComponent,
  },
];
