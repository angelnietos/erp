import { Route } from '@angular/router';

export const josanzBudgetsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@josanz-erp/josanz-budgets-feature-list').then(
        (m) => m.JosanzBudgetsFeatureListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('@josanz-erp/josanz-budgets-feature-list').then((m) => m.JosanzBudgetCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@josanz-erp/josanz-budgets-feature-list').then((m) => m.JosanzBudgetDetailComponent),
  },
];