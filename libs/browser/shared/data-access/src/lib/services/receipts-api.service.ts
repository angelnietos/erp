import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

export interface ReceiptApiDto {
  id: string;
  invoiceId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptsApiService {
  private readonly http = inject(HttpClient);

  list(status?: string): Observable<ReceiptApiDto[]> {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<ReceiptApiDto[]>(`/api/receipts${q}`).pipe(
      catchError(() => of([])),
    );
  }

  markPaid(
    id: string,
    body: { paymentMethod: string; paymentDate?: string },
  ): Observable<unknown> {
    return this.http.patch(`/api/receipts/${id}/pay`, body).pipe(
      catchError(() => of(null)),
    );
  }
}
