import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, CreateBudgetDTO } from '@josanz-erp/budget-api';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/budgets';

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  getBudget(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  createBudget(dto: CreateBudgetDTO): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, dto);
  }

  // Add more methods as needed (addItem, delete, etc.)
}
