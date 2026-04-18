import { Route } from '@angular/router';
import { BudgetListComponent } from './budget-list/budget-list.component';

export const budgetFeatureRoutes: Route[] = [
  { path: '', component: BudgetListComponent },
  { path: 'new', loadComponent: () => import('./budget-create/budget-create.component').then(m => m.BudgetCreateComponent) },
  { path: ':id/edit', loadComponent: () => import('./budget-create/budget-create.component').then(m => m.BudgetCreateComponent) },
  { path: ':id', loadComponent: () => import('./budget-detail/budget-detail.component').then(m => m.BudgetDetailComponent) },
];

export * from './budget-list/budget-list.component';
export * from './budget-create/budget-create.component';
