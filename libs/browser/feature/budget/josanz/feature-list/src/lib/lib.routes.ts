import { Route } from '@angular/router';

export const josanzBudgetsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./josanz-budgets-feature-list/josanz-budgets-feature-list').then(
        (m) => m.JosanzBudgetsFeatureListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./josanz-budget-create/josanz-budget-create').then(
        (m) => m.JosanzBudgetCreateComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./josanz-budget-detail/josanz-budget-detail').then(
        (m) => m.JosanzBudgetDetailComponent
      ),
  },
];
