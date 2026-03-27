import { Injectable, signal, computed } from '@angular/core';
import { VerifactuRecord, VerifactuEnqueueRequest, EnqueueInvoiceResponse } from '@josanz-erp/verifactu-api';
import { VerifactuService } from '../services/verifactu.service';

export interface VerifactuState {
	records: VerifactuRecord[];
	loading: boolean;
	lastEnqueue?: EnqueueInvoiceResponse | null;
}

@Injectable({ providedIn: 'root' })
export class VerifactuStore {
	private state = signal<VerifactuState>({ records: [], loading: false, lastEnqueue: null });

	records = computed(() => this.state().records);
	loading = computed(() => this.state().loading);
	lastEnqueue = computed(() => this.state().lastEnqueue);

	constructor(private service: VerifactuService) {}

	loadRecords(tenantId: string): void {
		this.state.update((s) => ({ ...s, loading: true }));
		this.service.loadRecords(tenantId).subscribe({
			next: (records) => this.state.update((s) => ({ ...s, records, loading: false })),
			error: () => this.state.update((s) => ({ ...s, loading: false })),
		});
	}

	submitInvoice(payload: VerifactuEnqueueRequest): void {
		this.state.update((s) => ({ ...s, loading: true, lastEnqueue: null }));
		this.service.submitInvoice(payload).subscribe({
			next: (res) => this.state.update((s) => ({ ...s, loading: false, lastEnqueue: res })),
			error: () => this.state.update((s) => ({ ...s, loading: false })),
		});
	}
}

