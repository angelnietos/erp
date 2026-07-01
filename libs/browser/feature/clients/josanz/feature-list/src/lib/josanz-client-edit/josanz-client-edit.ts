import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  type Client,
  type ClientContact,
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
  normalizeHexColor,
  railColorForClientName,
} from '@josanz-erp/josanz-ui';

const DEFAULT_TARIFF_OPTIONS = ['Especial 01', 'Especial 02', 'Tarifa estándar'];

@Component({
  selector: 'lib-josanz-client-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    JosanzClientRailPickerComponent,
    MainDetailLayoutComponent,
    ButtonComponent,
  ],
  templateUrl: './josanz-client-edit.html',
})
export class JosanzClientEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);

  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');

  tariffOptions = [...DEFAULT_TARIFF_OPTIONS];

  form: FormGroup;
  private readonly razonSocialValue: ReturnType<typeof toSignal<string>>;
  private clientId = '';

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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/clients']);
      return;
    }

    this.clientId = id;
    this.clientService
      .getClient(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (client) => {
          if (!client) {
            this.errorMessage.set('Cliente no encontrado.');
            return;
          }
          this.patchForm(client);
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar el cliente.');
        },
      });
  }

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
    if (!this.clientId || this.loading()) {
      return;
    }

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
      .updateClient(this.clientId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/clients'], {
            queryParams: { updated: '1' },
          });
        },
        error: () => {
          this.errorMessage.set('No se pudo guardar el cliente. Inténtalo de nuevo.');
        },
      });
  }

  onCancel(): void {
    this.onBack();
  }

  private patchForm(client: Client): void {
    const tarifaValue = client.tariffLabel ?? this.tariffOptions[0];
    if (tarifaValue && !this.tariffOptions.includes(tarifaValue)) {
      this.tariffOptions = [...this.tariffOptions, tarifaValue];
    }

    const colorRail =
      normalizeHexColor(client.railColor ?? '') ||
      normalizeHexColor(
        railColorForClientName(client.id, client.name ?? '', client.sector),
      ) ||
      defaultClientRailColor();

    this.form.patchValue({
      razonSocial: client.name ?? '',
      email: client.email ?? '',
      telefono: client.phone ?? '',
      tarifa: tarifaValue,
      colorRail,
    });

    this.operadores.clear();
    const contacts = client.contacts ?? [];
    if (contacts.length === 0) {
      this.operadores.push(this.createOperatorGroup(1));
      return;
    }

    contacts.forEach((contact, index) => {
      this.operadores.push(this.createOperatorGroupFromContact(contact, index + 1));
    });
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

  private createOperatorGroupFromContact(contact: ClientContact, index: number): FormGroup {
    return this.fb.group({
      nombre: [contact.name?.trim() || `Nuevo Operador ${String(index).padStart(2, '0')}`, josanzNonEmptyTrim],
      email: [contact.email ?? '', [josanzNonEmptyTrim, Validators.email]],
      telefono: [contact.phone ?? '', josanzNonEmptyTrim],
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
