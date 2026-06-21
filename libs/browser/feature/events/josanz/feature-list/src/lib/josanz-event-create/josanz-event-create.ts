import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InputComponent,
  MainDetailLayoutComponent,
  josanzNonEmptyTrim,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent,
  ],
  templateUrl: './josanz-event-create.html',
})
export class JosanzEventCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly eventTypes = ['Evento externo', 'Hotel', 'Espacio'];
  readonly selectedType = signal('Evento externo');

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', josanzNonEmptyTrim],
      localizacion: ['', josanzNonEmptyTrim],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      montaje: [''],
      cliente: ['', josanzNonEmptyTrim],
      tipologia: ['Evento externo', josanzNonEmptyTrim],
      operador: ['', josanzNonEmptyTrim],
    });
  }

  selectType(type: string): void {
    this.selectedType.set(type);
    this.form.patchValue({ tipologia: type });
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
