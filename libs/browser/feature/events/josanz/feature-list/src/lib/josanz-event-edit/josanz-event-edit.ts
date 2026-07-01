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
import { finalize, startWith, catchError, EMPTY, tap } from 'rxjs';
import { ClientService, ClientsFacade, type Client, type ClientContact } from '@josanz-erp/clients-data-access';
import {
  JosanzEventApiService,
  type EventDateBlock,
  type EventVenueBlock,
  type JosanzEventRecord,
  type UpdateJosanzEventPayload,
} from '../services/josanz-event-api.service';
import {
  JOSANZ_EVENT_STATUS_OPTIONS,
  JOSANZ_EVENT_UI_TYPES,
  typologyLabelFromApi,
  isoDatePart,
  statusPillKeyFromApi,
  type JosanzEventUiType,
} from '../josanz-event-form.utils';
import {
  ButtonComponent,
  InputComponent,
  JosanzClientRailPickerComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  MainDetailLayoutComponent,
  SelectComponent,
  CatalogThemeFacade,
  josanzNonEmptyTrim,
  normalizeHexColor,
  tenantEventStatusColor,
  defaultEventStatusPillColor,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    JosanzClientRailPickerComponent,
    MainDetailLayoutComponent,
    ButtonComponent,
    JosanzDeleteConfirmHostComponent,
  ],
  templateUrl: './josanz-event-edit.html',
})
export class JosanzEventEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly eventService = inject(JosanzEventApiService);
  private readonly catalogTheme = inject(CatalogThemeFacade);
  readonly deleteConfirm = inject(JosanzDeleteConfirmService);

  readonly eventTypes = JOSANZ_EVENT_UI_TYPES;
  readonly statusOptions = JOSANZ_EVENT_STATUS_OPTIONS.map((o) => ({
    label: o.label,
    value: o.value,
  }));

  readonly selectedType = signal<JosanzEventUiType>('Evento externo');
  readonly clients = signal<Client[]>([]);
  readonly saving = signal(false);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');

  private eventId = '';

  form: FormGroup;
  private readonly selectedClientId: ReturnType<typeof toSignal<string>>;

  constructor() {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      operatorContactId: [''],
      nombre: ['', josanzNonEmptyTrim],
      status: ['DRAFT', Validators.required],
      statusPillColor: [
        defaultEventStatusPillColor('DRAFT', 'outline'),
        [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
      ],
      eventDates: this.fb.array([this.createEventDateGroup()]),
      localizacion: [''],
      venues: this.fb.array([this.createVenueGroup()]),
    });

    this.selectedClientId = toSignal(
      this.form.get('clientId')!.valueChanges.pipe(
        startWith(this.form.get('clientId')!.value as string),
      ),
      { initialValue: '' },
    );
  }

  readonly showVenuePanels = computed(() => {
    const type = this.selectedType();
    return type === 'Hotel' || type === 'Espacio';
  });

  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({ label: client.name, value: client.id })),
  );

  readonly operatorOptions = computed(() => {
    const clientId = this.selectedClientId();
    if (!clientId) {
      return [];
    }
    const client = this.clients().find((c) => c.id === clientId);
    return (client?.contacts ?? []).map((contact) => ({
      label: contact.name,
      value: contact.id,
    }));
  });

  readonly operatorSelectHint = computed(() => {
    if (!this.selectedClientId()) {
      return 'Selecciona primero un cliente';
    }
    if (!this.operatorOptions().length) {
      return 'Este cliente no tiene operadores.';
    }
    return '';
  });

  get eventDates(): FormArray {
    return this.form.get('eventDates') as FormArray;
  }

  eventDateGroup(index: number): FormGroup {
    return this.eventDates.at(index) as FormGroup;
  }

  get venues(): FormArray {
    return this.form.get('venues') as FormArray;
  }

  venueGroup(index: number): FormGroup {
    return this.venues.at(index) as FormGroup;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/events']);
      return;
    }
    this.eventId = id;
    this.catalogTheme.loadCatalogTheme();

    this.clientsFacade.loadClients();
    this.clientService.getClients().subscribe({
      next: (apiClients) => {
        const clients = this.mergeClients(apiClients, this.clientsFacade.clients());
        this.clients.set(clients);
        this.loadEvent(clients);
      },
      error: () => this.loadEvent([]),
    });

    this.form.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      this.syncOperatorForClient(clientId, this.clients());
      this.updateOperatorValidators(clientId);
      this.updateLocationValidators();
    });

    this.form.get('status')?.valueChanges.subscribe((status: string) => {
      this.applyDefaultStatusColor(status);
    });
  }

  selectType(type: JosanzEventUiType): void {
    this.selectedType.set(type);
    this.updateLocationValidators();
  }

  addVenue(): void {
    this.venues.push(this.createVenueGroup());
  }

  addEventDate(): void {
    this.eventDates.push(this.createEventDateGroup());
  }

  removeEventDate(index: number): void {
    if (this.eventDates.length <= 1) {
      return;
    }
    this.eventDates.removeAt(index);
  }

  removeVenue(index: number): void {
    if (this.venues.length <= 1) {
      return;
    }
    this.venues.removeAt(index);
  }

  onBack(): void {
    void this.router.navigate(['/events', this.eventId]);
  }

  onSave(): void {
    this.validationBanner.set('');
    if (this.form.invalid || this.saving() || this.loading()) {
      this.form.markAllAsTouched();
      this.validationBanner.set('Revisa los campos obligatorios marcados en rojo.');
      return;
    }

    const payload = this.buildPayload();
    this.saving.set(true);
    this.errorMessage.set('');

    this.eventService
      .update(this.eventId, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/events', this.eventId], {
            queryParams: { updated: '1' },
          });
        },
        error: () => {
          this.errorMessage.set('No se pudo guardar el evento. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }

  onCancel(): void {
    this.onBack();
  }

  onDeleteClick(): void {
    if (!this.eventId || this.loading() || this.saving()) {
      return;
    }

    const name = ((this.form.get('nombre')?.value as string) ?? '').trim() || 'este evento';

    this.deleteConfirm.ask({
      feature: 'events',
      itemName: name,
      onConfirm: () =>
        this.eventService.delete(this.eventId).pipe(
          tap(() => {
            void this.router.navigate(['/events'], { queryParams: { deleted: '1' } });
          }),
          catchError(() => {
            this.errorMessage.set('No se pudo eliminar el evento. Inténtalo de nuevo.');
            return EMPTY;
          }),
        ),
    });
  }

  private loadEvent(clients: Client[]): void {
    this.loading.set(true);
    this.eventService
      .getById(this.eventId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (event) => {
          this.patchForm(event, clients);
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar el evento.');
        },
      });
  }

  private patchForm(event: JosanzEventRecord, clients: Client[]): void {
    const uiType = typologyLabelFromApi(event.typology);
    this.selectedType.set(uiType);
    this.updateLocationValidators();

    this.eventDates.clear();
    const schedule =
      event.eventSchedule?.length > 0
        ? event.eventSchedule
        : [{ date: isoDatePart(event.startDate), time: event.eventTime ?? '00:00' }];
    for (const slot of schedule) {
      this.eventDates.push(
        this.fb.group({
          fecha: [slot.date, Validators.required],
          hora: [slot.time ?? '00:00'],
        }),
      );
    }

    this.venues.clear();
    const venues = event.venueSchedule?.length ? event.venueSchedule : [{}];
    for (const venue of venues) {
      this.venues.push(this.createVenueGroup(venue));
    }

    const pillKey = statusPillKeyFromApi(event.status);
    const theme = this.catalogTheme.mergedTheme();
    const defaultPill =
      normalizeHexColor(event.statusPillColor ?? '') ??
      tenantEventStatusColor(theme, pillKey) ??
      defaultEventStatusPillColor(event.status, 'outline');

    this.form.patchValue({
      clientId: event.clientId ?? '',
      operatorContactId: event.operatorContactId ?? '',
      nombre: event.name,
      status: event.status,
      statusPillColor: defaultPill,
      localizacion: event.location ?? '',
    });

    if (event.clientId) {
      this.syncOperatorForClient(event.clientId, clients);
      this.updateOperatorValidators(event.clientId);
    }
  }

  private applyDefaultStatusColor(status: string): void {
    const pillKey = statusPillKeyFromApi(status);
    const theme = this.catalogTheme.mergedTheme();
    const color =
      tenantEventStatusColor(theme, pillKey) ??
      defaultEventStatusPillColor(status, 'outline');
    this.form.patchValue({ statusPillColor: color }, { emitEvent: false });
  }

  private mergeClients(apiClients: Client[], cachedClients: Client[]): Client[] {
    const byId = new Map<string, Client>();
    for (const client of apiClients) {
      byId.set(client.id, client);
    }
    for (const client of cachedClients) {
      byId.set(client.id, client);
    }
    return [...byId.values()];
  }

  private createEventDateGroup(): FormGroup {
    return this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      hora: ['00:00'],
    });
  }

  private createVenueGroup(venue?: EventVenueBlock): FormGroup {
    return this.fb.group({
      salon: [venue?.salon ?? ''],
      subsala: [venue?.subsala ?? ''],
      setupDate: [venue?.setupDate ?? ''],
      setupTime: [venue?.setupTime ?? '00:00'],
      teardownDate: [venue?.teardownDate ?? ''],
      teardownTime: [venue?.teardownTime ?? '00:00'],
    });
  }

  private syncOperatorForClient(clientId: string, clients: Client[]): void {
    const client = clients.find((c) => c.id === clientId);
    const operators = client?.contacts ?? [];
    const current = this.form.get('operatorContactId')?.value as string;
    if (current && operators.some((c) => c.id === current)) {
      return;
    }
    const primary =
      operators.find((c: ClientContact) => c.isPrimary) ?? operators[0];
    this.form.patchValue({ operatorContactId: primary?.id ?? '' });
  }

  private updateOperatorValidators(clientId: string): void {
    const client = this.clients().find((c) => c.id === clientId);
    const hasOperators = (client?.contacts?.length ?? 0) > 0;
    const control = this.form.get('operatorContactId');
    if (!control) {
      return;
    }
    if (hasOperators) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  private updateLocationValidators(): void {
    const control = this.form.get('localizacion');
    if (!control) {
      return;
    }
    if (this.selectedType() === 'Evento externo') {
      control.setValidators(josanzNonEmptyTrim);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  private buildPayload(): UpdateJosanzEventPayload {
    const raw = this.form.getRawValue() as {
      clientId: string;
      operatorContactId: string;
      nombre: string;
      status: string;
      statusPillColor: string;
      eventDates: Array<{ fecha: string; hora: string }>;
      localizacion: string;
      venues: EventVenueBlock[];
    };

    const eventSchedule: EventDateBlock[] = raw.eventDates
      .map((slot) => ({
        date: slot.fecha?.trim() ?? '',
        time: (slot.hora?.trim() || '00:00').slice(0, 5),
      }))
      .filter((slot) => slot.date);

    const primary = eventSchedule[0];
    if (!primary) {
      throw new Error('Fecha del evento obligatoria');
    }

    const typology = this.selectedType();
    const venueSchedule = this.showVenuePanels()
      ? raw.venues.filter(
          (v) =>
            v.salon?.trim() ||
            v.subsala?.trim() ||
            v.setupDate?.trim() ||
            v.teardownDate?.trim(),
        )
      : [];

    const location =
      typology === 'Evento externo'
        ? raw.localizacion.trim()
        : raw.localizacion.trim() ||
          [venueSchedule[0]?.salon, venueSchedule[0]?.subsala]
            .filter(Boolean)
            .join(' / ');

    const pillColor = normalizeHexColor(raw.statusPillColor);

    return {
      name: raw.nombre.trim(),
      clientId: raw.clientId,
      operatorContactId: raw.operatorContactId || undefined,
      typology,
      startDate: primary.date,
      eventTime: primary.time,
      eventSchedule,
      location: location || undefined,
      venueSchedule: venueSchedule.length ? venueSchedule : undefined,
      status: raw.status,
      statusPillColor: pillColor,
      notes: undefined,
    };
  }
}
