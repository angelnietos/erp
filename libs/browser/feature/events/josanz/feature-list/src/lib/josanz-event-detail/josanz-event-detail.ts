import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, catchError, EMPTY, tap, startWith } from 'rxjs';
import { ClientService, ClientsFacade, type Client } from '@josanz-erp/clients-data-access';
import {
  DocumentItemComponent,
  InputComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  JosanzFigmaDetailShellComponent,
  SelectComponent,
  SecondaryButtonComponent,
  CatalogThemeFacade,
  eventStatusLabel,
  typologyTabFromApi,
  type JosanzFigmaDetailShellConfig,
  type JosanzStatusPillKey,
} from '@josanz-erp/josanz-ui';
import { JosanzEventApiService, type JosanzEventRecord } from '../services/josanz-event-api.service';
import {
  JOSANZ_EVENT_STATUS_OPTIONS,
  JOSANZ_EVENT_UI_TYPES,
  statusPillKeyFromApi,
  typologyLabelFromApi,
  type JosanzEventUiType,
} from '../josanz-event-form.utils';
import {
  applyDefaultEventStatusColor,
  buildJosanzEventPayload,
  createEventDateGroup,
  createJosanzEventForm,
  createVenueGroup,
  eventDateGroupAt,
  eventDatesControl,
  formatEventMetaFromForm,
  mergeEventClients,
  operatorOptionsForClient,
  operatorSelectHint,
  patchJosanzEventForm,
  syncOperatorForClient,
  updateEventLocationValidators,
  updateOperatorValidators,
  venueGroupAt,
  venuesControl,
} from '../josanz-event-form.helpers';

interface JosanzEventNote {
  id: string;
  text: string;
}

interface JosanzEventStaffMember {
  id: string;
  name: string;
  role: string;
  tag: string;
  pillKey: JosanzStatusPillKey;
  avatarUrl: string;
}

interface JosanzEventEquipment {
  id: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
  imageUrl: string;
}

interface JosanzBudgetCatalogItem {
  id: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
}

interface JosanzEventEmail {
  id: string;
  time: string;
  subject: string;
  preview: string;
}

@Component({
  selector: 'josanz-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JosanzFigmaDetailShellComponent,
    SecondaryButtonComponent,
    DocumentItemComponent,
    JosanzDeleteConfirmHostComponent,
    InputComponent,
    SelectComponent,
  ],
  templateUrl: './josanz-event-detail.html',
})
export class JosanzEventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly eventApi = inject(JosanzEventApiService);
  private readonly clientService = inject(ClientService);
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);

  readonly eventTypes = JOSANZ_EVENT_UI_TYPES;
  readonly statusOptions = JOSANZ_EVENT_STATUS_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value,
  }));

  readonly event = signal<JosanzEventRecord | null>(null);
  readonly clients = signal<Client[]>([]);
  readonly selectedType = signal<JosanzEventUiType>('Evento externo');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');
  readonly deleteErrorMessage = signal('');
  readonly showSaveToast = signal(false);

  form: FormGroup = createJosanzEventForm(this.fb);
  private readonly selectedClientId = toSignal(
    this.form.get('clientId')!.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly nombreValue = toSignal(
    this.form.get('nombre')!.valueChanges.pipe(startWith('')),
    { initialValue: '' },
  );
  private readonly statusValue = toSignal(
    this.form.get('status')!.valueChanges.pipe(startWith('DRAFT')),
    { initialValue: 'DRAFT' },
  );

  staffDraft = '';
  budgetSearch = '';
  showBudgetPicker = signal(false);
  highlightedBudgetId = signal('mic-03');
  budgetLines: JosanzBudgetCatalogItem[] = [];
  readonly equipmentImageFailed = signal<ReadonlySet<string>>(new Set());
  emailForm = { date: 'dd/mm/aaaa', subject: 'Asunto ejemplo', body: 'Cuerpo del email…' };

  private readonly baseShell: Omit<JosanzFigmaDetailShellConfig, 'title' | 'statusLabel' | 'statusPillKey' | 'saveDisabled'> = {
    listRoute: '/events',
    tabs: [
      'Resumen',
      'Cliente',
      'Staff',
      'Presupuestos',
      'Albaranes',
      'Facturas',
      'Informes / reportes',
      'Emails',
    ],
    tabSlugMap: {
      Resumen: 'resumen',
      Cliente: 'cliente',
      Staff: 'staff',
      Presupuestos: 'presupuestos',
      Albaranes: 'albaranes',
      Facturas: 'facturas',
      'Informes / reportes': 'informes',
      Emails: 'emails',
    },
    saveLabel: 'Guardar cambios',
    features: { footerActions: false, headerSave: true },
  };

  readonly shellConfig = computed<JosanzFigmaDetailShellConfig>(() => {
    const nombre = (this.nombreValue() ?? '').trim() || this.event()?.name || 'Evento';
    const status = (this.statusValue() as string) || this.event()?.status || 'DRAFT';
    return {
      ...this.baseShell,
      title: nombre,
      statusLabel: eventStatusLabel(status),
      statusPillKey: statusPillKeyFromApi(status),
      saveDisabled: this.form.invalid || this.saving() || this.loading() || !this.form.dirty,
    };
  });

  readonly heroTypologyLabel = computed(() => typologyTabFromApi(this.selectedType()));

  readonly heroMetaLine = computed(() => formatEventMetaFromForm(this.form, this.clients()));

  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({ label: client.name, value: client.id })),
  );

  readonly operatorOptions = computed(() =>
    operatorOptionsForClient(this.clients(), this.selectedClientId() ?? ''),
  );

  readonly operatorHint = computed(() =>
    operatorSelectHint(this.clients(), this.selectedClientId() ?? ''),
  );

  readonly eventNotes = computed<JosanzEventNote[]>(() => {
    const note = this.form.get('descripcion')?.value?.trim();
    if (!note) {
      return [];
    }
    return [{ id: '1', text: note }];
  });

  readonly deliveryNotes = ['Albarán 001.pdf', 'Albarán 002.pdf'];
  readonly invoices = ['Factura 001.pdf', 'Factura borrador.pdf'];
  readonly reportFiles = ['Informe post-evento.pdf', 'Checklist técnico.pdf'];
  readonly budgetTotal = '€ 340.00';

  readonly budgetCatalog: JosanzBudgetCatalogItem[] = [
    {
      id: 'mic-01',
      name: 'Micrófono 01',
      warehouse: 'Almacén X',
      status: 'Mantenimiento',
      pillKey: 'en-proceso',
    },
  ];

  readonly emails: JosanzEventEmail[] = [];
  readonly heroImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400&h=400';

  readonly staffNotes: JosanzEventNote[] = [];
  readonly inspirationFiles = ['1.pdf', '2.pdf'];
  readonly staffMembers: JosanzEventStaffMember[] = [];
  readonly equipment: JosanzEventEquipment[] = [];

  private eventId = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/events']);
      return;
    }
    this.eventId = id;
    this.catalogTheme.loadCatalogTheme();

    if (this.route.snapshot.queryParamMap.get('updated') === '1') {
      this.showSaveToast.set(true);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }

    this.clientsFacade.loadClients();
    this.clientService.getClients().subscribe({
      next: (apiClients) => {
        const clients = mergeEventClients(apiClients, this.clientsFacade.clients());
        this.clients.set(clients);
        this.loadEvent(clients);
      },
      error: () => this.loadEvent([]),
    });

    this.form.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      syncOperatorForClient(this.form, clientId, this.clients());
      updateOperatorValidators(this.form, this.clients(), clientId);
      updateEventLocationValidators(this.form, this.selectedType());
    });

    this.form.get('status')?.valueChanges.subscribe((status: string) => {
      applyDefaultEventStatusColor(this.form, status, this.catalogTheme);
    });

    this.budgetLines = this.budgetCatalog.slice(0, 1);
  }

  get eventDates(): FormArray {
    return eventDatesControl(this.form);
  }

  eventDateGroup(index: number): FormGroup {
    return eventDateGroupAt(this.form, index);
  }

  get venues(): FormArray {
    return venuesControl(this.form);
  }

  venueGroup(index: number): FormGroup {
    return venueGroupAt(this.form, index);
  }

  selectType(type: JosanzEventUiType): void {
    this.selectedType.set(type);
    updateEventLocationValidators(this.form, type);
    this.form.markAsDirty();
  }

  onShellTabChange(_tab: string): void {
    this.showBudgetPicker.set(false);
  }

  onSave(): void {
    this.validationBanner.set('');
    if (this.form.invalid || this.saving() || this.loading()) {
      this.form.markAllAsTouched();
      this.validationBanner.set('Revisa los campos obligatorios antes de guardar.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    let payload;
    try {
      payload = buildJosanzEventPayload(this.form, this.selectedType());
    } catch {
      this.validationBanner.set('Revisa los campos obligatorios antes de guardar.');
      this.saving.set(false);
      return;
    }

    this.eventApi
      .update(this.eventId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (updated) => {
          this.event.set(updated);
          patchJosanzEventForm(this.fb, this.form, updated, this.clients(), this.catalogTheme, this.selectedType);
          this.showSaveToast.set(true);
        },
        error: () => {
          this.errorMessage.set('No se pudo guardar el evento. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }

  dismissSaveToast(): void {
    this.showSaveToast.set(false);
  }

  onDeleteClick(): void {
    const current = this.event();
    if (!current || this.loading() || this.deleteConfirm.busy()) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deleteConfirm.ask({
      feature: 'events',
      itemName: current.name,
      onConfirm: () =>
        this.eventApi.delete(this.eventId).pipe(
          tap(() => {
            void this.router.navigate(['/events'], { queryParams: { deleted: '1' } });
          }),
          catchError(() => {
            this.deleteErrorMessage.set('No se pudo eliminar el evento. Inténtalo de nuevo.');
            return EMPTY;
          }),
        ),
    });
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  onEquipmentImageError(id: string): void {
    const next = new Set(this.equipmentImageFailed());
    next.add(id);
    this.equipmentImageFailed.set(next);
  }

  filteredBudgetCatalog(): JosanzBudgetCatalogItem[] {
    const q = this.budgetSearch.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.budgetCatalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q),
    );
  }

  onBudgetSearch(value: string): void {
    this.budgetSearch = value;
    this.showBudgetPicker.set(value.trim().length > 0);
  }

  onBudgetSearchBlur(): void {
    window.setTimeout(() => this.showBudgetPicker.set(false), 150);
  }

  openBudgetPicker(): void {
    this.showBudgetPicker.set(true);
  }

  closeBudgetPicker(): void {
    this.showBudgetPicker.set(false);
  }

  selectBudgetItem(item: JosanzBudgetCatalogItem): void {
    this.highlightedBudgetId.set(item.id);
    if (!this.budgetLines.some((line) => line.id === item.id)) {
      this.budgetLines = [...this.budgetLines, item];
    }
    this.budgetSearch = '';
    this.showBudgetPicker.set(false);
  }

  private loadEvent(clients: Client[]): void {
    this.loading.set(true);
    this.eventApi
      .getById(this.eventId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (event) => {
          this.event.set(event);
          patchJosanzEventForm(this.fb, this.form, event, clients, this.catalogTheme, this.selectedType);
        },
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });
  }
}
