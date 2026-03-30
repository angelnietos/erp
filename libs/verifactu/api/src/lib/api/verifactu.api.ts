import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	EnqueueInvoiceResponse,
	VerifactuEnqueueRequest,
	VerifactuRecord,
	VerifactuInvoiceDetail,
	SubmitToVerifactuResponse,
} from '../models/verifactu.models';

export const VERIFACTU_API_BASE_URL = 'VERIFACTU_API_BASE_URL';
export const VERIFACTU_TENANT_ID = 'VERIFACTU_TENANT_ID';

@Injectable({ providedIn: 'root' })
export class VerifactuApi {
	constructor(private http: HttpClient, @Inject(VERIFACTU_API_BASE_URL) private baseUrl: string) {}

	// Queue operations
	enqueueInvoice(payload: VerifactuEnqueueRequest): Observable<EnqueueInvoiceResponse> {
		return this.http.post<EnqueueInvoiceResponse>(`${this.baseUrl}/verifactu/queue/enqueue`, payload);
	}

	// Get all records for a tenant
	getRecords(tenantId: string): Observable<VerifactuRecord[]> {
		return this.http.get<VerifactuRecord[]>(`${this.baseUrl}/verifactu/records/${tenantId}`);
	}

	// Get single invoice detail
	getInvoiceDetail(invoiceId: string): Observable<VerifactuInvoiceDetail> {
		return this.http.get<VerifactuInvoiceDetail>(`${this.baseUrl}/verifactu/invoices/${invoiceId}`);
	}

	// Submit invoice directly to VeriFactu
	submitInvoice(invoiceId: string, tenantId: string): Observable<SubmitToVerifactuResponse> {
		return this.http.post<SubmitToVerifactuResponse>(`${this.baseUrl}/verifactu/submit`, {
			invoiceId,
			tenantId,
		});
	}

	// Get QR code for an invoice
	getQrCode(invoiceId: string): Observable<{ qrCode: string }> {
		return this.http.get<{ qrCode: string }>(`${this.baseUrl}/verifactu/invoices/${invoiceId}/qr`);
	}

	// Get processing status
	getQueueStatus(queueItemId: string): Observable<EnqueueInvoiceResponse> {
		return this.http.get<EnqueueInvoiceResponse>(`${this.baseUrl}/verifactu/queue/${queueItemId}`);
	}

	// Cancel invoice
	cancelInvoice(invoiceId: string, tenantId: string): Observable<{ success: boolean }> {
		return this.http.post<{ success: boolean }>(`${this.baseUrl}/verifactu/invoices/${invoiceId}/cancel`, {
			tenantId,
		});
	}
}

