import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import {
  ClientService,
  type CreateClientPayload,
} from '@josanz-erp/clients-data-access';
import {
  ButtonComponent,
  InputComponent,
  MainDetailLayoutComponent,
  josanzNonEmptyTrim,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    MainDetailLayoutComponent,
    ButtonComponent,
  ],
  templateUrl: './josanz-client-create.html',
})
export class JosanzClientCreateComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);

  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly tariffOptions = ['Especial 01', 'Especial 02', 'Tarifa estándar'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['', josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
      tarifa: [this.tariffOptions[0], Validators.required],
      operadores: this.fb.array([this.createOperatorGroup(1)]),
    });
  }

  readonly brandInitials = computed(() => {
    const name = (this.form.get('razonSocial')?.value as string) ?? '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return 'NC';
    }
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  });

  get operadores(): FormArray {
    return this.form.get('operadores') as FormArray;
  }

  operatorGroup(index: number): FormGroup {
    return this.operadores.at(index) as FormGroup;
  }

  addOperator(): void {
    this.operadores.push(this.createOperatorGroup(this.operadores.length + 1));
  }

  removeOperator(index: number): void {
    if (this.operadores.length <= 1) {
      return;
    }
    this.operadores.removeAt(index);
  }

  onBack(): void {
    void this.router.navigate(['/clients']);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving.set(true);
    this.errorMessage.set('');

    this.clientService
      .createClient(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (client) => {
          const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
          if (returnTo) {
            void this.router.navigate([returnTo], {
              queryParams: { clientId: client.id },
            });
            return;
          }
          void this.router.navigate(['/clients', client.id]);
        },
        error: () => {
          this.errorMessage.set('No se pudo crear el cliente. Inténtalo de nuevo.');
        },
      });
  }

  onCancel(): void {
    this.onBack();
  }

  private createOperatorGroup(index: number): FormGroup {
    return this.fb.group({
      nombre: [`Nuevo Operador ${String(index).padStart(2, '0')}`, josanzNonEmptyTrim],
      email: ['', [Validators.email]],
      telefono: [''],
    });
  }

  private buildPayload(): CreateClientPayload {
    const value = this.form.getRawValue() as {
      razonSocial: string;
      email: string;
      telefono: string;
      tarifa: string;
      operadores: Array<{ nombre: string; email: string; telefono: string }>;
    };

    return {
      name: value.razonSocial.trim(),
      email: value.email.trim(),
      phone: value.telefono.trim(),
      description: '',
      sector: 'corporate',
      type: 'COMPANY',
      tariffLabel: value.tarifa,
      contacts: value.operadores
        .filter((op) => op.nombre?.trim())
        .map((op, index) => ({
          name: op.nombre.trim(),
          email: op.email?.trim() || undefined,
          phone: op.telefono?.trim() || undefined,
          position: 'Operador',
          isPrimary: index === 0,
        })),
    };
  }
}
