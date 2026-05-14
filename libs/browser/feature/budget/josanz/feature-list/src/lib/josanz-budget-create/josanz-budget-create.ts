import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InputComponent,
  MainDetailLayoutComponent
} from '@josanz-erp/josanz-ui';

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

  activeTab = signal<string>('Datos generales');
  tabs = ['Datos generales'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      cliente: ['', Validators.required],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      notas: [''],
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
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
