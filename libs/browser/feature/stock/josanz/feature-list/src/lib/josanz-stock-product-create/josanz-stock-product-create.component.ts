import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent, MainDetailLayoutComponent, josanzNonEmptyTrim } from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-stock-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, MainDetailLayoutComponent],
  templateUrl: './josanz-stock-product-create.component.html',
})
export class JosanzStockProductCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    referencia: ['', josanzNonEmptyTrim],
    nombre: ['', josanzNonEmptyTrim],
    categoria: [''],
    stockMin: ['0'],
    almacen: [''],
  });

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
