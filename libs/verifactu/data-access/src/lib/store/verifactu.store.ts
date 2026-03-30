import { Injectable, signal, computed } from '@angular/core';
import {
	VerifactuRecord,
	VerifactuEnqueueRequest,
	EnqueueInvoiceResponse,
	VerifactuInvoiceDetail,
} from '@josanz-erp/verifactu-api';
import { VerifactuService } from '../services/verifactu.service';

export interface VerifactuState {
	records: VerifactuRecord[];
	loading: boolean;
	lastEnqueue?: EnqueueInvoiceResponse | null;
	selectedInvoice?: VerifactuInvoiceDetail | null;
	error?: string | null;
}

@Injectable({ providedIn: 'root' })
export class VerifactuStore {
	private state = signal<VerifactuState>({
		records: [],
		loading: false,
		lastEnqueue: null,
		selectedInvoice: null,
		error: null,
	});

	records = computed(() => this.state().records);
	loading = computed(() => this.state().loading);
	lastEnqueue = computed(() => this.state().lastEnqueue);
	selectedInvoice = computed(() => this.state().selectedInvoice);
	error = computed(() => this.state().error);

	constructor(private service: VerifactuService) {}

	// Load all records for a tenant
	loadRecords(tenantId: string): void {
		this.state.update((s) => ({ ...s, loading: true, error: null }));
		this.service.loadRecords(tenantId).subscribe({
			next: (records) => this.state.update((s) => ({ ...s, records, loading: false })),
			error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
		});
	}

	// Submit invoice to VeriFactu queue
	submitInvoice(payload: VerifactuEnqueueRequest): void {
		this.state.update((s) => ({ ...s, loading: true, lastEnqueue: null, error: null }));
		this.service.submitInvoice(payload).subscribe({
			next: (res) => this.state.update((s) => ({ ...s, loading: false, lastEnqueue: res })),
			error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
		});
	}

	// Submit invoice directly (bypasses queue)
	submitInvoiceDirect(invoiceId: string, tenantId: string): void {
		this.state.update((s) => ({ ...s, loading: true, error: null }));
		this.service.submitInvoiceDirect(invoiceId, tenantId).subscribe({
			next: (res) =>
				this.state.update((s) => ({
					...s,
					loading: false,
					lastEnqueue: { queueItemId: res.queueItemId ?? '', status: res.success ? 'PENDING' : 'FAILED' },
				})),
			error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
		});
	}

	// Load invoice detail
	loadInvoiceDetail(invoiceId: string): void {
		this.state.update((s) => ({ ...s, loading: true, error: null }));
		this.service.getInvoiceDetail(invoiceId).subscribe({
			next: (detail) => this.state.update((s) => ({ ...s, selectedInvoice: detail, loading: false })),
			error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
		});
	}

	// Load QR code
	loadQrCode(invoiceId: string): void {
		this.service.getQrCode(invoiceId).subscribe({
			next: (qrCode) =>
				this.state.update((s) => ({
					...s,
					selectedInvoice: s.selectedInvoice ? { ...s.selectedInvoice, qrCode } : null,
				})),
			error: () => {
				// QR is optional - don't show error if QR fails to load
			},
		});
	}

	// Cancel invoice
	cancelInvoice(invoiceId: string, tenantId: string): void {
		this.state.update((s) => ({ ...s, loading: true, error: null }));
		this.service.cancelInvoice(invoiceId, tenantId).subscribe({
			next: () => this.state.update((s) => ({ ...s, loading: false })),
			error: (err) => this.state.update((s) => ({ ...s, loading: false, error: err.message })),
		});
	}

	// Clear selected invoice
	clearSelectedInvoice(): void {
		this.state.update((s) => ({ ...s, selectedInvoice: null }));
	}

	// Clear error
	clearError(): void {
		this.state.update((s) => ({ ...s, error: null }));
	}
}


