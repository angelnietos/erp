import { Component, OnInit, ViewChildren, QueryList, computed, inject, signal } from '@angular/core';
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
import { finalize, startWith, catchError, EMPTY, tap, merge } from 'rxjs';
import {
  ClientService,
  ClientsFacade,
  type Client,
  type ClientContact,
  type CreateClientPayload,
} from '@josanz-erp/clients-data-access';
import {
  ButtonComponent,
  InputComponent,
  JosanzClientRailPickerComponent,
  JosanzClientStatusTypeFieldComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  MainDetailLayoutComponent,
  SkeletonComponent,
  defaultClientRailColor,
  defaultClientTariffPillColor,
  clientCategoryTypology,
  josanzNonEmptyTrim,
  leadingMarkGradientStyle,
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
    JosanzClientStatusTypeFieldComponent,
    MainDetailLayoutComponent,
    ButtonComponent,
    JosanzDeleteConfirmHostComponent,
    SkeletonComponent,
  ],
  templateUrl: './josanz-client-edit.html',
})
export class JosanzClientEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly clientsFacade = inject(ClientsFacade);
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);

  @ViewChildren(JosanzClientStatusTypeFieldComponent)
  statusTypeFields?: QueryList<JosanzClientStatusTypeFieldComponent>;

  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');
  private readonly formRevision = signal(0);
  private initialFormSnapshot = '';
  private baselineCaptured = false;

  form: FormGroup;
  private readonly razonSocialValue: ReturnType<typeof toSignal<string>>;
  private clientId = '';

  constructor() {
    this.form = this.fb.group({
      razonSocial: ['', josanzNonEmptyTrim],
      email: ['', [josanzNonEmptyTrim, Validators.email]],
      telefono: ['', josanzNonEmptyTrim],
      tarifa: [DEFAULT_TARIFF_OPTIONS[0], [Validators.required, josanzNonEmptyTrim]],
      colorRail: [
        defaultClientRailColor(),
        [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
      ],
      colorPill: [
        defaultClientTariffPillColor(DEFAULT_TARIFF_OPTIONS[0]),
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

    merge(this.form.valueChanges, this.form.statusChanges)
      .pipe(startWith(null))
      .subscribe(() => this.formRevision.update((n) => n + 1));
  }

  readonly hasUnsavedChanges = computed(() => {
    this.formRevision();
    if (this.loading() || !this.baselineCaptured) {
      return false;
    }
    return this.serializeFormState() !== this.initialFormSnapshot;
  });

  readonly canSave = computed(
    () =>
      !this.loading() &&
      !this.saving() &&
      this.form.valid &&
      this.hasUnsavedChanges(),
  );

  readonly saveStatusHint = computed(() => {
    if (this.loading()) {
      return '';
    }
    if (!this.form.valid) {
      return 'Completa los campos obligatorios para guardar.';
    }
    if (!this.hasUnsavedChanges()) {
      return 'Sin cambios pendientes.';
    }
    return 'Tienes cambios sin guardar.';
  });

  readonly brandInitials = computed(() =>
    this.initialsFromName(this.razonSocialValue() ?? ''),
  );

  readonly brandDisplayName = computed(() => {
    const name = (this.razonSocialValue() ?? '').trim();
    return name || 'Cliente';
  });

  readonly pageTitle = computed(() => 'Editar Cliente');

  brandPreviewStyles(): Record<string, string> {
    const rail =
      normalizeHexColor((this.form.get('colorRail')?.value as string) ?? '') ??
      defaultClientRailColor();
    const pill =
      normalizeHexColor((this.form.get('colorPill')?.value as string) ?? '') ??
      defaultClientTariffPillColor(this.form.get('tarifa')?.value as string);
    return leadingMarkGradientStyle(rail, pill);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/clients']);
      return;
    }

    this.clientId = id;
    this.clientsFacade.loadClients();

    const cached = this.clientsFacade.getClientFromCache(id);
    if (cached) {
      this.patchForm(cached);
      this.loading.set(false);
    }

    this.clientsFacade
      .ensureClient(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (client) => {
          if (!client) {
            if (!cached) {
              this.errorMessage.set('Cliente no encontrado.');
            }
            return;
          }
          this.patchForm(client);
        },
        error: () => {
          if (!cached) {
            this.errorMessage.set('No se pudo cargar el cliente.');
          }
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
    if (!this.confirmLeaveIfDirty()) {
      return;
    }
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
        next: (client) => {
          this.clientsFacade.upsertClient(client);
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

  saveButtonTitle(): string {
    if (this.canSave()) {
      return 'Guardar cambios del cliente';
    }
    return this.saveStatusHint();
  }

  onDeleteClick(): void {
    if (!this.clientId || this.loading() || this.saving()) {
      return;
    }

    const name =
      ((this.form.get('razonSocial')?.value as string) ?? '').trim() ||
      this.brandDisplayName();

    this.deleteConfirm.ask({
      feature: 'clients',
      itemName: name,
      onConfirm: () =>
        this.clientService.deleteClient(this.clientId).pipe(
          tap((success) => {
            if (!success) {
              throw new Error('delete failed');
            }
            this.clientsFacade.removeClientFromCache(this.clientId);
            void this.router.navigate(['/clients'], { queryParams: { deleted: '1' } });
          }),
          catchError(() => {
            this.errorMessage.set('No se pudo eliminar el cliente. Inténtalo de nuevo.');
            return EMPTY;
          }),
        ),
    });
  }

  private patchForm(client: Client): void {
    const preserveUserEdits = this.baselineCaptured && this.hasUnsavedChanges();
    const tarifaValue = client.tariffLabel ?? DEFAULT_TARIFF_OPTIONS[0];

    const colorRail =
      normalizeHexColor(client.railColor ?? '') ||
      normalizeHexColor(
        railColorForClientName(client.id, client.name ?? '', client.sector),
      ) ||
      defaultClientRailColor();

    const colorPill =
      normalizeHexColor(client.pillColor ?? '') ||
      defaultClientTariffPillColor(tarifaValue);

    this.form.patchValue({
      razonSocial: client.name ?? '',
      email: client.email ?? '',
      telefono: client.phone ?? '',
      tarifa: tarifaValue,
      colorRail,
      colorPill,
    });

    this.operadores.clear();
    const contacts = client.contacts ?? [];
    if (contacts.length === 0) {
      this.operadores.push(this.createOperatorGroup(1));
    } else {
      contacts.forEach((contact, index) => {
        this.operadores.push(this.createOperatorGroupFromContact(contact, index + 1));
      });
    }

    queueMicrotask(() => {
      this.statusTypeFields?.forEach((field) => field.registerExtraTypes([tarifaValue]));
    });

    if (!preserveUserEdits) {
      queueMicrotask(() => this.captureFormBaseline());
    }
  }

  private serializeFormState(): string {
    return JSON.stringify(this.form.getRawValue());
  }

  private captureFormBaseline(): void {
    this.initialFormSnapshot = this.serializeFormState();
    this.form.markAsPristine();
    this.baselineCaptured = true;
    this.formRevision.update((n) => n + 1);
  }

  private confirmLeaveIfDirty(): boolean {
    if (!this.hasUnsavedChanges()) {
      return true;
    }
    return window.confirm(
      'Tienes cambios sin guardar. ¿Quieres salir sin guardar?',
    );
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
      colorPill: string;
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
      pillColor: value.colorPill.trim().toUpperCase(),
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
