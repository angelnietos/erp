import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { VerifactuApi } from '@josanz-erp/verifactu-api';
import { EnqueueInvoiceResponse, VerifactuEnqueueRequest, VerifactuRecord } from '@josanz-erp/verifactu-api';

@Injectable({ providedIn: 'root' })
export class VerifactuService {
	constructor(private api: VerifactuApi) {}

	submitInvoice(payload: VerifactuEnqueueRequest): Observable<EnqueueInvoiceResponse> {
		return this.api.enqueueInvoice(payload);
	}

	loadRecords(tenantId: string): Observable<VerifactuRecord[]> {
		return this.api.getRecords(tenantId).pipe(map((items) => items ?? []));
	}
}

