import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnqueueInvoiceResponse, VerifactuEnqueueRequest, VerifactuRecord } from '../models/verifactu.models';

export const VERIFACTU_API_BASE_URL = 'VERIFACTU_API_BASE_URL';
export const VERIFACTU_TENANT_ID = 'VERIFACTU_TENANT_ID';

@Injectable({ providedIn: 'root' })
export class VerifactuApi {
	constructor(private http: HttpClient, @Inject(VERIFACTU_API_BASE_URL) private baseUrl: string) {}

	enqueueInvoice(payload: VerifactuEnqueueRequest): Observable<EnqueueInvoiceResponse> {
		return this.http.post<EnqueueInvoiceResponse>(`${this.baseUrl}/verifactu/queue/enqueue`, payload);
	}

	getRecords(tenantId: string): Observable<VerifactuRecord[]> {
		return this.http.get<VerifactuRecord[]>(`${this.baseUrl}/verifactu/records/${tenantId}`);
	}
}

