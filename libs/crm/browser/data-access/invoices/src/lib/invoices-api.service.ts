import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { invoicesPaths, type InvoiceRowDto } from '@generic-crm/invoices-api';
import {
  API_BASE_URL,
  joinApiUrl,
} from '@generic-crm/shared-browser-data-access';
import type { Observable } from 'rxjs';

export type { InvoiceRowDto };

@Injectable({ providedIn: 'root' })
export class InvoicesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(): Observable<InvoiceRowDto[]> {
    return this.http.get<InvoiceRowDto[]>(
      joinApiUrl(this.baseUrl, invoicesPaths.collection),
    );
  }

  create(body: {
    clientId?: string;
    total?: number;
    currency?: string;
  }): Observable<unknown> {
    return this.http.post<unknown>(
      joinApiUrl(this.baseUrl, invoicesPaths.collection),
      body,
    );
  }

  issue(invoiceId: string): Observable<unknown> {
    return this.http.patch<unknown>(
      joinApiUrl(this.baseUrl, invoicesPaths.issue(invoiceId)),
      {},
    );
  }
}
