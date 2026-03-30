import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { VerifactuApi } from '@josanz-erp/verifactu-api';
import {
	EnqueueInvoiceResponse,
	VerifactuEnqueueRequest,
	VerifactuRecord,
	VerifactuInvoiceDetail,
	SubmitToVerifactuResponse,
} from '@josanz-erp/verifactu-api';

@Injectable({ providedIn: 'root' })
export class VerifactuService {
	constructor(private api: VerifactuApi) {}

	// Submit invoice to VeriFactu queue
	submitInvoice(payload: VerifactuEnqueueRequest): Observable<EnqueueInvoiceResponse> {
		return this.api.enqueueInvoice(payload);
	}

	// Submit directly (bypasses queue, for immediate processing)
	submitInvoiceDirect(invoiceId: string, tenantId: string): Observable<SubmitToVerifactuResponse> {
		return this.api.submitInvoice(invoiceId, tenantId);
	}

	// Load all records for a tenant
	loadRecords(tenantId: string): Observable<VerifactuRecord[]> {
		return this.api.getRecords(tenantId).pipe(map((items) => items ?? []));
	}

	// Get single invoice detail
	getInvoiceDetail(invoiceId: string): Observable<VerifactuInvoiceDetail> {
		return this.api.getInvoiceDetail(invoiceId);
	}

	// Get QR code for an invoice
	getQrCode(invoiceId: string): Observable<string> {
		return this.api.getQrCode(invoiceId).pipe(map((res) => res.qrCode));
	}

	// Get queue status
	getQueueStatus(queueItemId: string): Observable<EnqueueInvoiceResponse> {
		return this.api.getQueueStatus(queueItemId);
	}

	// Cancel invoice
	cancelInvoice(invoiceId: string, tenantId: string): Observable<boolean> {
		return this.api.cancelInvoice(invoiceId, tenantId).pipe(map((res) => res.success));
	}
}

