import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MainDetailLayoutComponent],
  templateUrl: './josanz-event-create.html',
})
export class JosanzEventCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  activeTab = signal('Datos básicos');
  readonly tabs = ['Datos básicos'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', josanzNonEmptyTrim],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      cliente: ['', josanzNonEmptyTrim],
    });
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    if (this.form.valid) {
      void this.router.navigate(['/events']);
    }
  }

  onCancel(): void {
    void this.router.navigate(['/events']);
  }
}
