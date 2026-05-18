import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ButtonComponent,
  JosanzThemeService,
  SecondaryButtonComponent,
  UserAvatarComponent,
  josanzNonEmptyTrim,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    SecondaryButtonComponent,
    UserAvatarComponent,
  ],
  templateUrl: './josanz-client-create.html',
  styleUrl: './josanz-client-create.css',
})
export class JosanzClientCreateComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly theme = inject(JosanzThemeService);

  readonly clientTypes: { value: string; label: string; pillKey: JosanzStatusPillKey }[] = [
    { value: 'tipo-1', label: 'Tipo cliente', pillKey: 'cliente-tipo-pink' },
    { value: 'tipo-2', label: 'Tipo cliente', pillKey: 'cliente-tipo-green' },
    { value: 'tipo-3', label: 'Tipo cliente', pillKey: 'cliente-tipo-yellow' },
    { value: 'nuevo', label: 'Nuevo', pillKey: 'cliente-nuevo' },
  ];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['Empresa Ejemplo', josanzNonEmptyTrim],
      email: ['email@email.com', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['699432567', josanzNonEmptyTrim],
      tipo: ['tipo-1'],
    });
  }

  ngOnInit(): void {
    this.theme.setAtmosphere('neutral');
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
