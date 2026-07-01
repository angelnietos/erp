import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, startWith } from 'rxjs';
import {
  ClientService,
  type CreateClientPayload,
} from '@josanz-erp/clients-data-access';
import {
  ButtonComponent,
  InputComponent,
  JosanzClientRailPickerComponent,
  MainDetailLayoutComponent,
  defaultClientRailColor,
  clientCategoryTypology,
  josanzNonEmptyTrim,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'lib-josanz-client-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    JosanzClientRailPickerComponent,
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
  readonly validationBanner = signal('');

  readonly tariffOptions = ['Especial 01', 'Especial 02', 'Tarifa estándar'];

  form: FormGroup;
  private readonly razonSocialValue: ReturnType<typeof toSignal<string>>;

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['', josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
      tarifa: [this.tariffOptions[0], Validators.required],
      colorRail: [
        defaultClientRailColor(),
        [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
      ],
      operadores: this.fb.array([this.createOperatorGroup(1)]),
    });

    this.razonSocialValue = toSignal(
      this.form.get('razonSocial')!.valueChanges.pipe(
        startWith(this.form.get('razonSocial')!.value as string),
      ),
      { initialValue: '' },
    );
  }

  readonly brandInitials = computed(() =>
    this.initialsFromName(this.razonSocialValue() ?? ''),
  );

  readonly brandDisplayName = computed(() => {
    const name = (this.razonSocialValue() ?? '').trim();
    return name || 'Cliente';
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
    this.validationBanner.set('');
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      this.validationBanner.set('Revisa los campos obligatorios marcados en rojo.');
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
          void this.router.navigate(['/clients'], {
            queryParams: { created: '1' },
          });
        },
        error: () => {
          this.errorMessage.set('No se pudo crear el cliente. Inténtalo de nuevo.');
        },
      });
  }

  onCancel(): void {
    this.onBack();
  }

  private initialsFromName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'NC';
    }
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
    }
    return trimmed.slice(0, 2).toUpperCase();
  }

  private createOperatorGroup(index: number): FormGroup {
    return this.fb.group({
      nombre: [`Nuevo Operador ${String(index).padStart(2, '0')}`, josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
    });
  }

  private buildPayload(): CreateClientPayload {
    const value = this.form.getRawValue() as {
      razonSocial: string;
      email: string;
      telefono: string;
      tarifa: string;
      colorRail: string;
      operadores: Array<{ nombre: string; email: string; telefono: string }>;
    };

    return {
      name: value.razonSocial.trim(),
      email: value.email.trim(),
      phone: value.telefono.trim(),
      description: '',
      sector: clientCategoryTypology(value.razonSocial.trim()),
      type: 'COMPANY',
      tariffLabel: value.tarifa,
      railColor: value.colorRail.trim().toUpperCase(),
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
