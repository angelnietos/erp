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
		customerNif: ['', Validators.required],
		series: ['DEFAULT'],
		description: ['', Validators.required],
		quantity: [1, Validators.required],
		unitPrice: [0, Validators.required],
		taxRate: [21, Validators.required],
	});

	ngOnInit(): void {
		this.store.loadRecords();
	}

	onSubmit(): void {
		if (this.form.invalid) return;
		const v = this.form.value;
		this.store.submitInvoice({
			customerNif: v.customerNif!,
			series: v.series ?? 'DEFAULT',
			total: (v.quantity ?? 1) * (v.unitPrice ?? 0) * (1 + (v.taxRate ?? 21) / 100),
			lines: [
				{
					description: v.description!,
					quantity: v.quantity ?? 1,
					unitPrice: v.unitPrice ?? 0,
					taxRate: v.taxRate ?? 21,
				},
			],
		});
	}
}

