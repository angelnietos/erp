import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  type Client,
  type ClientContact,
} from '@josanz-erp/clients-data-access';
import {
  JosanzEventApiService,
  type CreateJosanzEventPayload,
  type EventVenueBlock,
} from '../services/josanz-event-api.service';
import {
  ButtonComponent,
  InputComponent,
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
  private readonly eventService = inject(JosanzEventApiService);

  readonly eventTypes = ['Evento externo', 'Hotel', 'Espacio'] as const;
  readonly selectedType = signal<(typeof this.eventTypes)[number]>('Evento externo');
  readonly clients = signal<Client[]>([]);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      operatorContactId: [''],
      nombre: ['', josanzNonEmptyTrim],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      hora: ['00:00'],
      localizacion: [''],
      venues: this.fb.array([this.createVenueGroup()]),
    });
  }

  readonly showVenuePanels = computed(() => {
    const type = this.selectedType();
    return type === 'Hotel' || type === 'Espacio';
  });

  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({ label: client.name, value: client.id })),
  );

  readonly operatorOptions = computed(() => {
    const clientId = this.form.get('clientId')?.value as string;
    const client = this.clients().find((c) => c.id === clientId);
    return (client?.contacts ?? []).map((contact) => ({
      label: contact.name,
      value: contact.id,
    }));
  });

  readonly previewName = computed(
    () => (this.form.get('nombre')?.value as string)?.trim() || 'Nombre ejemplo',
  );

  readonly previewDateTime = computed(() => {
    const fecha = (this.form.get('fecha')?.value as string) || 'dd/mm/aaaa';
    const hora = (this.form.get('hora')?.value as string) || '00:00';
    return `${fecha} ${hora}`;
  });

  get venues(): FormArray {
    return this.form.get('venues') as FormArray;
  }

  venueGroup(index: number): FormGroup {
    return this.venues.at(index) as FormGroup;
  }

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        const preselected = this.route.snapshot.queryParamMap.get('clientId');
        if (preselected && clients.some((c) => c.id === preselected)) {
          this.form.patchValue({ clientId: preselected });
          this.syncOperatorForClient(preselected, clients);
        }
      },
    });

    this.form.get('clientId')?.valueChanges.subscribe((clientId: string) => {
      this.syncOperatorForClient(clientId, this.clients());
    });
  }

  selectType(type: (typeof this.eventTypes)[number]): void {
    this.selectedType.set(type);
    if (type === 'Evento externo' && !this.form.get('localizacion')?.value) {
      this.form.patchValue({ localizacion: '' });
    }
  }

  addVenue(): void {
    this.venues.push(this.createVenueGroup());
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
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving.set(true);
    this.errorMessage.set('');

    this.eventService
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (event) => {
          void this.router.navigate(['/events', event.id]);
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

  private buildPayload(): CreateJosanzEventPayload {
    const raw = this.form.getRawValue() as {
      clientId: string;
      operatorContactId: string;
      nombre: string;
      fecha: string;
      hora: string;
      localizacion: string;
      venues: EventVenueBlock[];
    };

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
      startDate: raw.fecha,
      eventTime: raw.hora,
      location: location || undefined,
      venueSchedule: venueSchedule.length ? venueSchedule : undefined,
      status: 'DRAFT',
    };
  }
}
