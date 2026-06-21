import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  InputComponent,
  MainDetailLayoutComponent,
  josanzNonEmptyTrim,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent,
  ],
  templateUrl: './josanz-client-create.html',
})
export class JosanzClientCreateComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly clientTypes: { value: string; label: string; pillKey: JosanzStatusPillKey }[] = [
    { value: 'tipo-1', label: 'Tipo cliente 1', pillKey: 'cliente-tipo-pink' },
    { value: 'tipo-2', label: 'Tipo cliente 2', pillKey: 'cliente-tipo-green' },
    { value: 'tipo-3', label: 'Tipo cliente 3', pillKey: 'cliente-tipo-yellow' },
    { value: 'nuevo', label: 'Cliente nuevo', pillKey: 'cliente-nuevo' },
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['', josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
      tipo: ['tipo-1'],
    });
  }

  selectedTypePillKey(): JosanzStatusPillKey {
    const value = this.form.get('tipo')?.value as string;
    return this.clientTypes.find((t) => t.value === value)?.pillKey ?? 'cliente-tipo-pink';
  }

  selectedTypeLabel(): string {
    const value = this.form.get('tipo')?.value as string;
    return this.clientTypes.find((t) => t.value === value)?.label ?? 'Tipo cliente';
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  onBack(): void {
    void this.router.navigate(['/clients']);
  }

  onSubmit(): void {
    if (this.form.valid) {
      void this.router.navigate(['/clients'], { queryParams: { created: '1' } });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.onBack();
  }
}
