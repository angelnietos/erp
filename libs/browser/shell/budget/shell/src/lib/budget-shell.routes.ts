import { Route } from '@angular/router';

export const budgetRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetCreateComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('@josanz-erp/budget-feature').then(m => m.BudgetDetailComponent),
  },
];
