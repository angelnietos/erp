import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Budget, CreateBudgetDTO, BudgetStatus } from '@josanz-erp/budget-api';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = '/api/budgets';

  // Mock data
  private mockBudgets: Budget[] = [
    {
      id: 'bgt-001',
      clientId: '1',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      total: 4500,
      status: 'SENT',
      items: [
        { id: '1', productId: 'prod-001', quantity: 2, price: 1000, discount: 0, tax: 21 },
        { id: '2', productId: 'prod-002', quantity: 5, price: 500, discount: 10, tax: 21 },
      ],
      createdAt: '2026-03-01',
    },
    {
      id: 'bgt-002',
      clientId: '2',
      startDate: '2026-03-10',
      endDate: '2026-04-10',
      total: 8750,
      status: 'ACCEPTED',
      items: [
        { id: '3', productId: 'prod-003', quantity: 3, price: 2000, discount: 5, tax: 21 },
        { id: '4', productId: 'prod-004', quantity: 5, price: 750, discount: 0, tax: 21 },
      ],
      createdAt: '2026-03-10',
    },
    {
      id: 'bgt-003',
      clientId: '3',
      startDate: '2026-03-15',
      endDate: '2026-04-15',
      total: 3200,
      status: 'DRAFT',
      items: [
        { id: '5', productId: 'prod-005', quantity: 1, price: 3200, discount: 0, tax: 21 },
      ],
      createdAt: '2026-03-15',
    },
  ];

  getBudgets(): Observable<Budget[]> {
    return of(this.mockBudgets).pipe(delay(300));
  }

  getBudget(id: string): Observable<Budget | undefined> {
    return of(this.mockBudgets.find(b => b.id === id)).pipe(delay(200));
  }

  createBudget(dto: CreateBudgetDTO): Observable<Budget> {
    const newBudget: Budget = {
      id: 'bgt-' + Date.now().toString(36),
      clientId: dto.clientId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      total: 0,
      status: 'DRAFT',
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.mockBudgets = [...this.mockBudgets, newBudget];
    return of(newBudget).pipe(delay(300));
  }

  updateBudget(id: string, budget: Partial<Budget>): Observable<Budget> {
    const index = this.mockBudgets.findIndex(b => b.id === id);
    if (index >= 0) {
      this.mockBudgets[index] = { ...this.mockBudgets[index], ...budget };
      return of(this.mockBudgets[index]).pipe(delay(300));
    }
    throw new Error('Budget not found');
  }

  deleteBudget(id: string): Observable<boolean> {
    const index = this.mockBudgets.findIndex(b => b.id === id);
    if (index >= 0) {
      this.mockBudgets = this.mockBudgets.filter(b => b.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  searchBudgets(term: string): Observable<Budget[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockBudgets.filter(b =>
      b.id.toLowerCase().includes(searchTerm)
    );
    return of(results).pipe(delay(200));
  }

  getBudgetsByStatus(status: string): Observable<Budget[]> {
    if (status === 'all') {
      return this.getBudgets();
    }
    return of(this.mockBudgets.filter(b => b.status === status)).pipe(delay(200));
  }

  sendBudget(id: string): Observable<Budget> {
    return this.updateBudget(id, { status: 'SENT' });
  }

  acceptBudget(id: string): Observable<Budget> {
    return this.updateBudget(id, { status: 'ACCEPTED' });
  }

  rejectBudget(id: string): Observable<Budget> {
    return this.updateBudget(id, { status: 'REJECTED' });
  }
}
