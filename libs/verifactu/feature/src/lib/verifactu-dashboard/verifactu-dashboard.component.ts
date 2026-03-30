import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerifactuStore, VerifactuInvoiceDetail } from '@josanz-erp/verifactu-data-access';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@josanz-erp/shared-ui-kit';

@Component({
	selector: 'verifactu-dashboard',
	standalone: true,
	imports: [CommonModule, FormsModule, UiCardComponent, UiButtonComponent, UiBadgeComponent],
	templateUrl: './verifactu-dashboard.component.html',
	styleUrls: ['./verifactu-dashboard.component.css'],
})
export class VerifactuDashboardComponent implements OnInit {
	protected store = inject(VerifactuStore);

	// Form inputs
	tenantId = signal('');
	invoiceIdToSubmit = signal('');
	selectedInvoiceId = signal('');

	// Modal states
	isDetailModalOpen = signal(false);

	ngOnInit(): void {
		// Optionally load records on init if tenantId is available
	}

	loadRecords(): void {
		const tenant = this.tenantId();
		if (tenant) {
			this.store.loadRecords(tenant);
		}
	}

	submitInvoice(): void {
		const tenant = this.tenantId();
		const invoiceId = this.invoiceIdToSubmit();
		if (tenant && invoiceId) {
			this.store.submitInvoiceDirect(invoiceId, tenant);
			this.invoiceIdToSubmit.set('');
			// Reload records after submit
			setTimeout(() => this.loadRecords(), 500);
		}
	}

	viewInvoiceDetail(record: { id: string }): void {
		this.store.loadInvoiceDetail(record.id);
		this.selectedInvoiceId.set(record.id);
		this.isDetailModalOpen.set(true);
	}


	closeDetailModal(): void {
		this.isDetailModalOpen.set(false);
		this.store.clearSelectedInvoice();
	}

	getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'COMPLETED':
			case 'SENT':
				return 'badge-success';
			case 'PROCESSING':
			case 'PENDING':
				return 'badge-warning';
			case 'FAILED':
			case 'ERROR':
				return 'badge-danger';
			default:
				return 'badge-default';
		}
	}

	formatDate(dateStr: string): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	formatCurrency(amount: number | undefined): string {
		if (amount === undefined) return '-';
		return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
	}
}

