import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VerifactuStore } from '@josanz-erp/verifactu-data-access';
import { UiCardComponent, UiInputComponent } from '@josanz-erp/shared-ui-kit';

@Component({
	selector: 'verifactu-dashboard',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, UiCardComponent, UiInputComponent],
	templateUrl: './verifactu-dashboard.component.html',
	styleUrls: ['./verifactu-dashboard.component.css'],
})
export class VerifactuDashboardComponent {
	private fb = inject(FormBuilder);
	protected store = inject(VerifactuStore);

	form = this.fb.group({
		tenantId: ['', Validators.required],
		invoiceId: ['', Validators.required],
	});

	ngOnInit(): void {
		// records load requires tenantId; load after user types it and submits
	}

	onSubmit(): void {
		if (this.form.invalid) return;
		const v = this.form.value;
		this.store.submitInvoice({ tenantId: v.tenantId!, invoiceId: v.invoiceId! });
		this.store.loadRecords(v.tenantId!);
	}
}

