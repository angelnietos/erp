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
import { ClientService, ClientsFacade, type Client, type ClientContact } from '@josanz-erp/clients-data-access';
import {
  type CreateJosanzEventPayload,
  type EventDateBlock,
  type EventVenueBlock,
} from '../services/josanz-event-api.service';
import { JosanzEventsFacade } from '../services/josanz-events.facade';
import {
  ButtonComponent,
  InputComponent,
  JosanzClientRailPickerComponent,
  MainDetailLayoutComponent,
  SelectComponent,
  josanzNonEmptyTrim,
} from '@josanz-erp/josanz-ui';

@Component({
  selector: 'josanz-event-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    MainDetailLayoutComponent,
    ButtonComponent,
  ],
  templateUrl: './josanz-event-create.html',
})
export class JosanzEventCreateComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly clientsFacade = inject(ClientsFacade);
  private readonly eventsFacade = inject(JosanzEventsFacade);

  readonly eventTypes = ['Evento externo', 'Hotel', 'Espacio'] as const;
  readonly selectedType = signal<(typeof this.eventTypes)[number]>('Evento externo');
  readonly clients = signal<Client[]>([]);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly validationBanner = signal('');

  form: FormGroup;
  private readonly selectedClientId: ReturnType<typeof toSignal<string>>;

  constructor() {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      operatorContactId: [''],
      nombre: ['', josanzNonEmptyTrim],
      eventDates: this.fb.array([this.createEventDateGroup()]),
      localizacion: ['', josanzNonEmptyTrim],
      venues: this.fb.array([this.createVenueGroup()]),
    });

    this.selectedClientId = toSignal(
      this.form.get('clientId')!.valueChanges.pipe(
        startWith(this.form.get('clientId')!.value as string),
      ),
      { initialValue: '' },
    );

    this.updateLocationValidators();
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
    const count = this.operatorOptions().length;
    if (!this.selectedClientId()) {
      return 'Selecciona primero un cliente';
    }
    if (!count) {
      return 'Este cliente no tiene operadores. Añádelos desde Clientes.';
    }
    return '';
  });

  readonly previewName = computed(
    () => (this.form.get('nombre')?.value as string)?.trim() || 'Nombre ejemplo',
  );

  readonly previewDateTime = computed(() => {
    const slots = this.eventDates.controls
      .map((control) => {
        const fecha = (control.get('fecha')?.value as string) || '';
        const hora = (control.get('hora')?.value as string) || '00:00';
        if (!fecha) {
          return '';
        }
        return `${fecha} ${hora}`;
      })
      .filter(Boolean);
    if (!slots.length) {
      return 'dd/mm/aaaa 00:00';
    }
    if (slots.length === 1) {
      return slots[0];
    }
    return `${slots[0]} (+${slots.length - 1} más)`;
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
    this.clientsFacade.loadClients();
    this.clientService.getClients().subscribe({
      next: (apiClients) => {
        const cached = this.clientsFacade.clients();
        const clients = this.mergeClients(apiClients, cached);
        this.clients.set(clients);
        this.applyPreselectedClient(clients);
        this.updateLocationValidators();
      },
    });

    this.form.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      this.syncOperatorForClient(clientId, this.clients());
      this.updateOperatorValidators(clientId);
      this.updateLocationValidators();
    });
  }

  selectType(type: (typeof this.eventTypes)[number]): void {
    this.selectedType.set(type);
    this.updateLocationValidators();
    if (type === 'Evento externo' && !this.form.get('localizacion')?.value) {
      this.form.patchValue({ localizacion: '' });
    }
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
    void this.router.navigate(['/events']);
  }

  onSave(): void {
    this.validationBanner.set('');
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      this.validationBanner.set('Revisa los campos obligatorios marcados en rojo.');
      return;
    }

    const payload = this.buildPayload();
    this.saving.set(true);
    this.errorMessage.set('');

    this.eventsFacade
      .createEvent(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/events'], { queryParams: { created: '1' } });
        },
        error: () => {
          this.errorMessage.set('No se pudo crear el evento. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }

  onCancel(): void {
    this.onBack();
  }

  onAddClient(): void {
    void this.router.navigate(['/clients/new'], {
      queryParams: { returnTo: '/events/new' },
    });
  }

  private applyPreselectedClient(clients: Client[]): void {
    const preselected = this.route.snapshot.queryParamMap.get('clientId');
    if (preselected && clients.some((c) => c.id === preselected)) {
      this.form.patchValue({ clientId: preselected });
      this.syncOperatorForClient(preselected, clients);
      this.updateOperatorValidators(preselected);
    }
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

  private createVenueGroup(): FormGroup {
    return this.fb.group({
      salon: [''],
      subsala: [''],
      setupDate: [''],
      setupTime: ['00:00'],
      teardownDate: [''],
      teardownTime: ['00:00'],
    });
  }

  private syncOperatorForClient(clientId: string, clients: Client[]): void {
    const client = clients.find((c) => c.id === clientId);
    const operators = client?.contacts ?? [];
    const primary =
      operators.find((c: ClientContact) => c.isPrimary) ?? operators[0];
    this.form.patchValue({
      operatorContactId: primary?.id ?? '',
    });
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

  private buildPayload(): CreateJosanzEventPayload {
    const raw = this.form.getRawValue() as {
      clientId: string;
      operatorContactId: string;
      nombre: string;
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
      status: 'DRAFT',
    };
  }
}
