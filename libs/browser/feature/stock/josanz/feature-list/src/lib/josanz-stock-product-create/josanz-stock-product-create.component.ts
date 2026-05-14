import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent, MainDetailLayoutComponent } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MainDetailLayoutComponent],
  templateUrl: './josanz-stock-product-create.component.html',
})
export class JosanzStockProductCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly tabs = ['Datos del producto'];
  activeTab = signal('Datos del producto');

  readonly form: FormGroup = this.fb.group({
    referencia: ['', Validators.required],
    nombre: ['', Validators.required],
    categoria: [''],
    stockMin: ['0'],
    almacen: [''],
  });

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  onBack(): void {
    void this.router.navigate(['/stock']);
  }

  onSave(): void {
    if (this.form.valid) {
      this.onBack();
    }
  }

  onCancel(): void {
    this.onBack();
  }
}
