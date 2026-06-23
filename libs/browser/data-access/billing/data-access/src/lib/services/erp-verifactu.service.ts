import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ErpVerifactuOverview {
  queuePending: number;
  queueCompleted: number;
  queueFailed: number;
  invoicesSent: number;
  invoicesPending: number;
  invoicesError: number;
  serviceOperational: boolean;
  lastActivityAt: string | null;
}

export interface ErpVerifactuFiscalDetail {
  invoiceId: string;
  invoiceNumber: string;
  verifactuStatus: 'pending' | 'sent' | 'error';
  aeatReference: string | null;
  currentHash: string | null;
  previousHash: string | null;
  qrCode: string | null;
  queueStatus: string | null;
  lastError: string | null;
  issueDate: string;
  total: number;
  customerNif: string;
}

@Injectable({ providedIn: 'root' })
export class ErpVerifactuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/verifactu';

  getOverview(): Observable<ErpVerifactuOverview> {
    return this.http.get<ErpVerifactuOverview>(`${this.baseUrl}/overview`);
  }

  getInvoiceFiscal(invoiceId: string): Observable<ErpVerifactuFiscalDetail> {
    return this.http.get<ErpVerifactuFiscalDetail>(
      `${this.baseUrl}/invoices/${invoiceId}/fiscal`,
    );
  }
}
