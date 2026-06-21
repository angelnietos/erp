import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-budget-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent
  ],
  templateUrl: './josanz-budget-create.html',
})
export class JosanzBudgetCreateComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      cliente: ['', josanzNonEmptyTrim],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      evento: [''],
      validoHasta: [''],
      notas: [''],
    });
  }

  onBack() {
    this.router.navigate(['/budgets']);
  }

  onSave() {
    if (this.form.valid) {
      console.log('Creando presupuesto:', this.form.value);
      this.onBack();
    }
  }

  onCancel() {
    this.onBack();
  }
}
