import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Budget } from '@josanz-erp/budget-api';
import { BudgetService } from '../services/budget.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  error: null,
};

import { Router } from '@angular/router';
import { CreateBudgetDTO } from '@josanz-erp/budget-api';

export const BudgetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, budgetService = inject(BudgetService), router = inject(Router)) => ({
    loadBudgets: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          budgetService.getBudgets().pipe(
            tapResponse({
              next: (budgets: Budget[]) => patchState(store, { budgets, loading: false }),
              error: (error: Error) => patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
    createBudget: rxMethod<CreateBudgetDTO>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((dto) =>
          budgetService.createBudget(dto).pipe(
            tapResponse({
              next: () => {
                patchState(store, { loading: false });
                router.navigate(['/budgets']);
              },
              error: (error: Error) => patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
    updateBudget: rxMethod<{ id: string; dto: CreateBudgetDTO }>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(({ id, dto }) =>
          budgetService.updateBudget(id, dto).pipe(
            tapResponse({
              next: () => {
                patchState(store, { loading: false });
                router.navigate(['/budgets', id]);
              },
              error: (error: Error) => patchState(store, { error: error.message, loading: false }),
            })
          )
        )
      )
    ),
  }))
);
