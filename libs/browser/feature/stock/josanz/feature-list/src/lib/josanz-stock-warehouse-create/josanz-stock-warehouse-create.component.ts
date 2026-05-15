import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-warehouse-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MainDetailLayoutComponent],
  templateUrl: './josanz-stock-warehouse-create.component.html',
})
export class JosanzStockWarehouseCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly tabs = ['Datos del almacén'];
  activeTab = signal('Datos del almacén');

  readonly form: FormGroup = this.fb.group({
    nombre: ['', josanzNonEmptyTrim],
    codigo: ['', josanzNonEmptyTrim],
    direccion: [''],
    notas: [''],
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
