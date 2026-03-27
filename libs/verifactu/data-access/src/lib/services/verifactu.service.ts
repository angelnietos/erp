import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { VerifactuApi } from '@josanz-erp/verifactu-api';
import { EnqueueInvoiceResponse, VerifactuInvoicePayload, VerifactuRecord } from '@josanz-erp/verifactu-api';

@Injectable({ providedIn: 'root' })
export class VerifactuService {
	constructor(private api: VerifactuApi) {}

	submitInvoice(payload: VerifactuInvoicePayload): Observable<EnqueueInvoiceResponse> {
		return this.api.enqueueInvoice(payload);
	}

	loadRecords(): Observable<VerifactuRecord[]> {
		return this.api.getRecords().pipe(map((items) => items ?? []));
	}
}

