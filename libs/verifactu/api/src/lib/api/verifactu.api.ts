import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnqueueInvoiceResponse, VerifactuInvoicePayload, VerifactuRecord } from '../models/verifactu.models';

export const VERIFACTU_API_BASE_URL = 'VERIFACTU_API_BASE_URL';

@Injectable({ providedIn: 'root' })
export class VerifactuApi {
	constructor(private http: HttpClient, @Inject(VERIFACTU_API_BASE_URL) private baseUrl: string) {}

	enqueueInvoice(payload: VerifactuInvoicePayload): Observable<EnqueueInvoiceResponse> {
		return this.http.post<EnqueueInvoiceResponse>(`${this.baseUrl}/verifactu/queue/enqueue`, payload);
	}

	getRecords(): Observable<VerifactuRecord[]> {
		return this.http.get<VerifactuRecord[]>(`${this.baseUrl}/verifactu/records`);
	}
}

