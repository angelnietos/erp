import { Routes } from '@angular/router';

export const budgetRoutes: Routes = [
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
    loadComponent: () => import('@josanz-erp/shared-ui-kit').then(m => m.DetailPlaceholderComponent),
  },
];
