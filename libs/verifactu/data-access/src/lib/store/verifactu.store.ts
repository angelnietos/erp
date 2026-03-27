import { Injectable, signal, computed } from '@angular/core';
import { VerifactuRecord, VerifactuInvoicePayload, EnqueueInvoiceResponse } from '@josanz-erp/verifactu-api';
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

	loadRecords(): void {
		this.state.update((s) => ({ ...s, loading: true }));
		this.service.loadRecords().subscribe({
			next: (records) => this.state.update((s) => ({ ...s, records, loading: false })),
			error: () => this.state.update((s) => ({ ...s, loading: false })),
		});
	}

	submitInvoice(payload: VerifactuInvoicePayload): void {
		this.state.update((s) => ({ ...s, loading: true, lastEnqueue: null }));
		this.service.submitInvoice(payload).subscribe({
			next: (res) => this.state.update((s) => ({ ...s, loading: false, lastEnqueue: res })),
			error: () => this.state.update((s) => ({ ...s, loading: false })),
		});
	}
}

