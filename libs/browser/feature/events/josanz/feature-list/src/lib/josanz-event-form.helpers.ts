import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import type { Client, ClientContact } from '@josanz-erp/clients-data-access';
import {
  CatalogThemeFacade,
  defaultEventStatusPillColor,
  josanzNonEmptyTrim,
  normalizeHexColor,
  resolveEventStatusPillColor,
} from '@josanz-erp/josanz-ui';
import type {
  EventDateBlock,
  EventVenueBlock,
  JosanzEventRecord,
  UpdateJosanzEventPayload,
} from './services/josanz-event-api.service';
import {
  isoDatePart,
  typologyLabelFromApi,
  type JosanzEventUiType,
} from './josanz-event-form.utils';

export function createEventDateGroup(fb: FormBuilder, date?: string, time?: string): FormGroup {
  return fb.group({
    fecha: [date ?? new Date().toISOString().substring(0, 10), Validators.required],
    hora: [time ?? '00:00'],
  });
}

export function createVenueGroup(fb: FormBuilder, venue?: EventVenueBlock): FormGroup {
  return fb.group({
    salon: [venue?.salon ?? ''],
    subsala: [venue?.subsala ?? ''],
    setupDate: [venue?.setupDate ?? ''],
    setupTime: [venue?.setupTime ?? '00:00'],
    teardownDate: [venue?.teardownDate ?? ''],
    teardownTime: [venue?.teardownTime ?? '00:00'],
  });
}

export function createJosanzEventForm(fb: FormBuilder): FormGroup {
  return fb.group({
    clientId: ['', Validators.required],
    operatorContactId: [''],
    nombre: ['', josanzNonEmptyTrim],
    status: ['DRAFT', Validators.required],
    statusPillColor: [
      defaultEventStatusPillColor('DRAFT', 'outline'),
      [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)],
    ],
    descripcion: [''],
    eventDates: fb.array([createEventDateGroup(fb)]),
    localizacion: [''],
    venues: fb.array([createVenueGroup(fb)]),
  });
}

export function mergeEventClients(apiClients: Client[], cachedClients: Client[]): Client[] {
  const byId = new Map<string, Client>();
  for (const client of apiClients) {
    byId.set(client.id, client);
  }
  for (const client of cachedClients) {
    byId.set(client.id, client);
  }
  return [...byId.values()];
}

export function patchJosanzEventForm(
  fb: FormBuilder,
  form: FormGroup,
  event: JosanzEventRecord,
  clients: Client[],
  catalogTheme: CatalogThemeFacade,
  selectedType: { set: (v: JosanzEventUiType) => void },
): JosanzEventUiType {
  const uiType = typologyLabelFromApi(event.typology);
  selectedType.set(uiType);
  updateEventLocationValidators(form, uiType);

  const eventDates = form.get('eventDates') as FormArray;
  eventDates.clear();
  const schedule =
    event.eventSchedule?.length > 0
      ? event.eventSchedule
      : [{ date: isoDatePart(event.startDate), time: event.eventTime ?? '00:00' }];
  for (const slot of schedule) {
    eventDates.push(createEventDateGroup(fb, slot.date, slot.time ?? '00:00'));
  }

  const venues = form.get('venues') as FormArray;
  venues.clear();
  const venueList = event.venueSchedule?.length ? event.venueSchedule : [{}];
  for (const venue of venueList) {
    venues.push(createVenueGroup(fb, venue));
  }

  const theme = catalogTheme.mergedTheme();
  const defaultPill =
    normalizeHexColor(event.statusPillColor ?? '') ??
    resolveEventStatusPillColor(event.status, theme) ??
    defaultEventStatusPillColor(event.status, 'outline');

  form.patchValue({
    clientId: event.clientId ?? '',
    operatorContactId: event.operatorContactId ?? '',
    nombre: event.name,
    status: event.status,
    statusPillColor: defaultPill,
    localizacion: event.location ?? '',
    descripcion: event.summary?.trim() || event.notes?.trim() || '',
  });

  if (event.clientId) {
    syncOperatorForClient(form, event.clientId, clients);
    updateOperatorValidators(form, clients, event.clientId);
  }

  form.markAsPristine();
  return uiType;
}

export function applyDefaultEventStatusColor(
  form: FormGroup,
  status: string,
  catalogTheme: CatalogThemeFacade,
): void {
  const theme = catalogTheme.mergedTheme();
  const color =
    resolveEventStatusPillColor(status, theme) ??
    defaultEventStatusPillColor(status, 'outline');
  form.patchValue({ statusPillColor: color }, { emitEvent: false });
}

export function syncOperatorForClient(
  form: FormGroup,
  clientId: string,
  clients: Client[],
): void {
  const client = clients.find((c) => c.id === clientId);
  const operators = client?.contacts ?? [];
  const current = form.get('operatorContactId')?.value as string;
  if (current && operators.some((c) => c.id === current)) {
    return;
  }
  const primary = operators.find((c: ClientContact) => c.isPrimary) ?? operators[0];
  form.patchValue({ operatorContactId: primary?.id ?? '' });
}

export function updateOperatorValidators(
  form: FormGroup,
  clients: Client[],
  clientId: string,
): void {
  const client = clients.find((c) => c.id === clientId);
  const hasOperators = (client?.contacts?.length ?? 0) > 0;
  const control = form.get('operatorContactId');
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

export function updateEventLocationValidators(
  form: FormGroup,
  selectedType: JosanzEventUiType,
): void {
  const control = form.get('localizacion');
  if (!control) {
    return;
  }
  if (selectedType === 'Evento externo') {
    control.setValidators(josanzNonEmptyTrim);
  } else {
    control.clearValidators();
  }
  control.updateValueAndValidity({ emitEvent: false });
}

export function buildJosanzEventPayload(
  form: FormGroup,
  selectedType: JosanzEventUiType,
): UpdateJosanzEventPayload {
  const raw = form.getRawValue() as {
    clientId: string;
    operatorContactId: string;
    nombre: string;
    status: string;
    statusPillColor: string;
    descripcion: string;
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

  const showVenuePanels = selectedType === 'Hotel' || selectedType === 'Espacio';
  const venueSchedule = showVenuePanels
    ? raw.venues.filter(
        (v) =>
          v.salon?.trim() ||
          v.subsala?.trim() ||
          v.setupDate?.trim() ||
          v.teardownDate?.trim(),
      )
    : [];

  const location =
    selectedType === 'Evento externo'
      ? raw.localizacion.trim()
      : raw.localizacion.trim() ||
        [venueSchedule[0]?.salon, venueSchedule[0]?.subsala].filter(Boolean).join(' / ');

  const pillColor = normalizeHexColor(raw.statusPillColor);
  const descripcion = raw.descripcion?.trim();

  return {
    name: raw.nombre.trim(),
    clientId: raw.clientId,
    operatorContactId: raw.operatorContactId || undefined,
    typology: selectedType,
    startDate: primary.date,
    eventTime: primary.time,
    eventSchedule,
    location: location || undefined,
    venueSchedule: venueSchedule.length ? venueSchedule : undefined,
    status: raw.status,
    statusPillColor: pillColor,
    summary: descripcion || undefined,
    notes: descripcion || undefined,
  };
}

export function eventDatesControl(form: FormGroup): FormArray {
  return form.get('eventDates') as FormArray;
}

export function eventDateGroupAt(form: FormGroup, index: number): FormGroup {
  return eventDatesControl(form).at(index) as FormGroup;
}

export function venuesControl(form: FormGroup): FormArray {
  return form.get('venues') as FormArray;
}

export function venueGroupAt(form: FormGroup, index: number): FormGroup {
  return venuesControl(form).at(index) as FormGroup;
}

export function operatorOptionsForClient(clients: Client[], clientId: string) {
  if (!clientId) {
    return [];
  }
  const client = clients.find((c) => c.id === clientId);
  return (client?.contacts ?? []).map((contact) => ({
    label: contact.name,
    value: contact.id,
  }));
}

export function operatorSelectHint(clients: Client[], clientId: string): string {
  if (!clientId) {
    return 'Selecciona primero un cliente';
  }
  if (!operatorOptionsForClient(clients, clientId).length) {
    return 'Este cliente no tiene operadores.';
  }
  return '';
}

export function formatEventMetaFromForm(
  form: FormGroup,
  clients: Client[],
): string {
  const parts = formatEventMetaParts(form, clients);
  return `Fecha: ${parts.date} · Operador: ${parts.operator} · Lugar: ${parts.location}`;
}

export function formatEventMetaParts(
  form: FormGroup,
  clients: Client[],
): { date: string; operator: string; location: string } {
  const raw = form.getRawValue() as {
    clientId: string;
    operatorContactId: string;
    eventDates: Array<{ fecha: string; hora: string }>;
    localizacion: string;
  };
  const dateRaw = raw.eventDates[0]?.fecha;
  const date = dateRaw ? new Date(dateRaw) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'dd/mm/aaaa';
  const client = clients.find((c) => c.id === raw.clientId);
  const operator =
    client?.contacts?.find((c) => c.id === raw.operatorContactId)?.name ?? '—';
  const location = raw.localizacion?.trim() || '—';
  return { date: dateLabel, operator, location };
}
