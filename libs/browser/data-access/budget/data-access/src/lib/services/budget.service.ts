import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, CreateBudgetDTO } from '@josanz-erp/budget-api';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = '/api/budgets';



  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudget(id: string): Observable<Budget | null> {
    return this.http.get<Budget | null>(`${this.apiUrl}/${id}`);
  }

  createBudget(dto: CreateBudgetDTO): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, dto);
  }

  updateBudget(id: string, dto: CreateBudgetDTO): Observable<Budget> {
    return this.http.patch<Budget>(`${this.apiUrl}/${id}`, dto);
  }

  deleteBudget(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  searchBudgets(term: string): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  getBudgetsByStatus(status: string): Observable<Budget[]> {
    if (status === 'all') {
      return this.getBudgets();
    }
    return this.http.get<Budget[]>(`${this.apiUrl}?status=${status}`);
  }

  sendBudget(id: string): Observable<Budget> {
    return this.http.patch<Budget>(`${this.apiUrl}/${id}/send`, {});
  }

  acceptBudget(id: string): Observable<Budget> {
    return this.http.patch<Budget>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectBudget(id: string): Observable<Budget> {
    return this.http.patch<Budget>(`${this.apiUrl}/${id}/reject`, {});
  }
}
