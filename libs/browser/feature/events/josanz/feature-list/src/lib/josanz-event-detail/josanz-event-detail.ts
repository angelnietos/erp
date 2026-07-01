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
  ButtonComponent,
  DocumentItemComponent,
  InputComponent,
  JosanzDeleteConfirmHostComponent,
  JosanzDeleteConfirmService,
  JosanzFigmaDetailShellComponent,
  ModalComponent,
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
  type JosanzEventUiType,
} from '../josanz-event-form.utils';
import {
  applyDefaultEventStatusColor,
  buildJosanzEventPayload,
  createJosanzEventForm,
  eventDateGroupAt,
  eventDatesControl,
  formatEventMetaParts,
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

interface JosanzStaffOption {
  id: string;
  name: string;
  role: string;
  pillKey: JosanzStatusPillKey;
}

interface JosanzEventStaffMember {
  id: string;
  optionId: string;
  name: string;
  role: string;
  tag: string;
  pillKey: JosanzStatusPillKey;
  avatarUrl: string;
}

interface JosanzBudgetLine {
  id: string;
  units: number;
  itemId: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
  price: number;
  days: number;
  coef: number;
  discount: number;
}

interface JosanzEventFile {
  id: string;
  name: string;
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
  date: string;
  time: string;
  subject: string;
  preview: string;
  body: string;
  expanded: boolean;
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
    ButtonComponent,
    ModalComponent,
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
  readonly heroDetailsOpen = signal(false);

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

  budgetSearch = '';
  showBudgetPicker = signal(false);
  highlightedBudgetId = signal('');
  readonly budgetLines = signal<JosanzBudgetLine[]>([]);
  budgetObservations =
    'La jornada del técnico es de 8h (+1 hora para comer). El coste de la hora extra del técnico es de 35€/hora (IVA no incluido).';
  budgetAddress = '';
  budgetContact = '';
  // --- Notas al evento (persisted in summary) ---
  readonly eventNotes = signal<JosanzEventNote[]>([]);
  eventNoteComposerOpen = signal(false);
  eventNoteDraft = '';
  editingEventNoteId = signal<string | null>(null);
  editingEventNoteText = '';

  // --- Notas al staff (persisted in notes) ---
  readonly staffNotes = signal<JosanzEventNote[]>([]);
  staffNoteComposerOpen = signal(false);
  staffNoteDraft = '';
  editingStaffNoteId = signal<string | null>(null);
  editingStaffNoteText = '';

  // --- Inspiración del evento ---
  readonly inspirationFiles = signal<JosanzEventFile[]>([]);

  // --- Staff ---
  readonly staffMembers = signal<JosanzEventStaffMember[]>([]);
  staffPickerOpen = signal(false);
  staffPickerEditingId = signal<string | null>(null);

  // --- Documentos (Albaranes / Facturas / Informes) ---
  readonly deliveryNotes = signal<JosanzEventFile[]>([]);
  readonly invoices = signal<JosanzEventFile[]>([]);
  readonly reportFiles = signal<JosanzEventFile[]>([]);

  // --- Emails ---
  readonly emails = signal<JosanzEventEmail[]>([]);
  emailComposerOpen = signal(false);
  emailForm = { date: '', subject: '', body: '' };
  editingEmailId = signal<string | null>(null);

  // --- Modal subir documentación ---
  readonly uploadModalOpen = signal(false);
  private uploadTarget:
    | 'inspiration'
    | 'delivery'
    | 'invoice'
    | 'report'
    | null = null;
  uploadFileName = signal('');

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
    tabAlerts: { Staff: true, Presupuestos: true },
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

  readonly heroMetaParts = computed(() => formatEventMetaParts(this.form, this.clients()));

  readonly heroHasDescription = computed(() =>
    Boolean((this.form.get('descripcion')?.value ?? '').toString().trim()),
  );

  readonly clientOptions = computed(() =>
    this.clients().map((client) => ({ label: client.name, value: client.id })),
  );

  readonly operatorOptions = computed(() =>
    operatorOptionsForClient(this.clients(), this.selectedClientId() ?? ''),
  );

  readonly operatorHint = computed(() =>
    operatorSelectHint(this.clients(), this.selectedClientId() ?? ''),
  );

  readonly heroImage = 'assets/josanz-figma/login-logo.png';

  readonly budgetCatalog: JosanzBudgetCatalogItem[] = [
    { id: 'cam-0000', name: 'Cámara 0000', warehouse: 'Almacén X', status: 'Disponible', pillKey: 'confirmado' },
    { id: 'cam-0001', name: 'Cámara 0001', warehouse: 'Almacén X', status: 'En uso', pillKey: 'en-proceso' },
    { id: 'cam-0002', name: 'Cámara 0002', warehouse: 'Almacén X', status: 'Avería', pillKey: 'cancelado' },
    { id: 'cam-0007', name: 'Cámara 0007', warehouse: 'Almacén Y', status: 'En uso', pillKey: 'en-proceso' },
    { id: 'cam-0011', name: 'Cámara 0011', warehouse: 'Almacén Z', status: 'Disponible', pillKey: 'confirmado' },
    { id: 'cam-0008', name: 'Cámara 0008', warehouse: 'Almacén G', status: 'Disponible', pillKey: 'confirmado' },
    { id: 'mic-01', name: 'Micrófono 01', warehouse: 'Almacén X', status: 'Disponible', pillKey: 'confirmado' },
  ];

  readonly staffCatalog: JosanzStaffOption[] = [
    { id: 'p01', name: 'Persona 01', role: 'Técnico', pillKey: 'staff-tecnico' },
    { id: 'p02', name: 'Persona 02', role: 'En prácticas', pillKey: 'staff-practicas' },
    { id: 'p03', name: 'Persona 03', role: 'Técnico', pillKey: 'staff-tecnico' },
    { id: 'p04', name: 'Persona 04', role: 'Técnico', pillKey: 'staff-tecnico' },
    { id: 'p05', name: 'Persona 05', role: 'En prácticas', pillKey: 'staff-practicas' },
    { id: 'p06', name: 'Persona 06', role: 'Freelance', pillKey: 'staff-freelance' },
    { id: 'p07', name: 'Persona 07', role: 'Freelance', pillKey: 'staff-freelance' },
  ];

  readonly staffOptions = computed(() =>
    this.staffCatalog.map((s) => ({ label: `${s.name} · ${s.role}`, value: s.id })),
  );

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

  openHeroDetails(): void {
    this.heroDetailsOpen.set(true);
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

    const staffNotesText = this.staffNotes()
      .map((n) => n.text)
      .join('\n');
    payload = { ...payload, notes: staffNotesText || undefined };

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

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // ---------------------------------------------------------------------------
  // Notas al evento
  // ---------------------------------------------------------------------------
  openEventNoteComposer(): void {
    this.eventNoteDraft = '';
    this.eventNoteComposerOpen.set(true);
  }

  cancelEventNoteComposer(): void {
    this.eventNoteComposerOpen.set(false);
    this.eventNoteDraft = '';
  }

  addEventNote(): void {
    const text = this.eventNoteDraft.trim();
    if (!text) {
      return;
    }
    this.eventNotes.update((notes) => [...notes, { id: this.nextId('note'), text }]);
    this.eventNoteComposerOpen.set(false);
    this.eventNoteDraft = '';
    this.form.markAsDirty();
  }

  startEditEventNote(note: JosanzEventNote): void {
    this.editingEventNoteId.set(note.id);
    this.editingEventNoteText = note.text;
  }

  saveEventNote(id: string): void {
    const text = this.editingEventNoteText.trim();
    if (!text) {
      this.removeEventNote(id);
      return;
    }
    this.eventNotes.update((notes) =>
      notes.map((n) => (n.id === id ? { ...n, text } : n)),
    );
    this.editingEventNoteId.set(null);
    this.form.markAsDirty();
  }

  cancelEditEventNote(): void {
    this.editingEventNoteId.set(null);
  }

  removeEventNote(id: string): void {
    this.eventNotes.update((notes) => notes.filter((n) => n.id !== id));
    if (this.editingEventNoteId() === id) {
      this.editingEventNoteId.set(null);
    }
    this.form.markAsDirty();
  }

  // ---------------------------------------------------------------------------
  // Notas al staff
  // ---------------------------------------------------------------------------
  openStaffNoteComposer(): void {
    this.staffNoteDraft = '';
    this.staffNoteComposerOpen.set(true);
  }

  cancelStaffNoteComposer(): void {
    this.staffNoteComposerOpen.set(false);
    this.staffNoteDraft = '';
  }

  addStaffNote(): void {
    const text = this.staffNoteDraft.trim();
    if (!text) {
      return;
    }
    this.staffNotes.update((notes) => [...notes, { id: this.nextId('snote'), text }]);
    this.staffNoteComposerOpen.set(false);
    this.staffNoteDraft = '';
    this.form.markAsDirty();
  }

  startEditStaffNote(note: JosanzEventNote): void {
    this.editingStaffNoteId.set(note.id);
    this.editingStaffNoteText = note.text;
  }

  saveStaffNote(id: string): void {
    const text = this.editingStaffNoteText.trim();
    if (!text) {
      this.removeStaffNote(id);
      return;
    }
    this.staffNotes.update((notes) =>
      notes.map((n) => (n.id === id ? { ...n, text } : n)),
    );
    this.editingStaffNoteId.set(null);
    this.form.markAsDirty();
  }

  cancelEditStaffNote(): void {
    this.editingStaffNoteId.set(null);
  }

  removeStaffNote(id: string): void {
    this.staffNotes.update((notes) => notes.filter((n) => n.id !== id));
    if (this.editingStaffNoteId() === id) {
      this.editingStaffNoteId.set(null);
    }
    this.form.markAsDirty();
  }

  // ---------------------------------------------------------------------------
  // Staff members
  // ---------------------------------------------------------------------------
  openStaffPicker(editId: string | null = null): void {
    this.staffPickerEditingId.set(editId);
    this.staffPickerOpen.set(true);
  }

  cancelStaffPicker(): void {
    this.staffPickerOpen.set(false);
    this.staffPickerEditingId.set(null);
  }

  onStaffPicked(optionId: string): void {
    const option = this.staffCatalog.find((s) => s.id === optionId);
    if (!option) {
      return;
    }
    const editId = this.staffPickerEditingId();
    if (editId) {
      this.staffMembers.update((members) =>
        members.map((m) =>
          m.id === editId
            ? { ...m, optionId: option.id, name: option.name, role: option.role, tag: option.role, pillKey: option.pillKey }
            : m,
        ),
      );
    } else {
      this.staffMembers.update((members) => [
        ...members,
        {
          id: this.nextId('staff'),
          optionId: option.id,
          name: option.name,
          role: option.role,
          tag: option.role,
          pillKey: option.pillKey,
          avatarUrl: '',
        },
      ]);
    }
    this.staffPickerOpen.set(false);
    this.staffPickerEditingId.set(null);
    this.form.markAsDirty();
  }

  removeStaffMember(id: string): void {
    this.staffMembers.update((members) => members.filter((m) => m.id !== id));
    this.form.markAsDirty();
  }

  staffInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  // ---------------------------------------------------------------------------
  // Presupuestos
  // ---------------------------------------------------------------------------
  filteredBudgetCatalog(): JosanzBudgetCatalogItem[] {
    const q = this.budgetSearch.trim().toLowerCase();
    if (!q) {
      return this.budgetCatalog;
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
    this.showBudgetPicker.set(true);
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

  addBudgetLine(): void {
    this.budgetLines.update((lines) => [
      ...lines,
      {
        id: this.nextId('line'),
        units: 0,
        itemId: '',
        name: '',
        warehouse: '',
        status: '',
        pillKey: 'en-proceso',
        price: 0,
        days: 0,
        coef: 0,
        discount: 0,
      },
    ]);
    this.form.markAsDirty();
  }

  selectBudgetItem(lineId: string, item: JosanzBudgetCatalogItem): void {
    this.highlightedBudgetId.set(item.id);
    this.budgetLines.update((lines) =>
      lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              itemId: item.id,
              name: item.name,
              warehouse: item.warehouse,
              status: item.status,
              pillKey: item.pillKey,
            }
          : line,
      ),
    );
    this.budgetSearch = '';
    this.showBudgetPicker.set(false);
    this.form.markAsDirty();
  }

  updateBudgetLine(lineId: string, field: keyof JosanzBudgetLine, value: string): void {
    const num = Number(value.replace(',', '.'));
    this.budgetLines.update((lines) =>
      lines.map((line) =>
        line.id === lineId ? { ...line, [field]: Number.isFinite(num) ? num : 0 } : line,
      ),
    );
    this.form.markAsDirty();
  }

  removeBudgetLine(lineId: string): void {
    this.budgetLines.update((lines) => lines.filter((line) => line.id !== lineId));
    this.form.markAsDirty();
  }

  budgetLineTotal(line: JosanzBudgetLine): number {
    const base = line.units * line.price * (line.days || 1) * (line.coef || 1);
    const discounted = base * (1 - (line.discount || 0) / 100);
    return Math.round(discounted * 100) / 100;
  }

  readonly budgetSubtotal = computed(() =>
    this.budgetLines().reduce((sum, line) => sum + this.budgetLineTotal(line), 0),
  );
  readonly budgetTax = computed(() => Math.round(this.budgetSubtotal() * 0.21 * 100) / 100);
  readonly budgetTotal = computed(() => Math.round((this.budgetSubtotal() + this.budgetTax()) * 100) / 100);

  formatCurrency(value: number): string {
    return `€ ${value.toFixed(2)}`;
  }

  // ---------------------------------------------------------------------------
  // Emails
  // ---------------------------------------------------------------------------
  openEmailComposer(): void {
    this.editingEmailId.set(null);
    this.emailForm = { date: '', subject: '', body: '' };
    this.emailComposerOpen.set(true);
  }

  cancelEmailComposer(): void {
    this.emailComposerOpen.set(false);
    this.editingEmailId.set(null);
    this.emailForm = { date: '', subject: '', body: '' };
  }

  saveEmail(): void {
    const subject = this.emailForm.subject.trim();
    const body = this.emailForm.body.trim();
    if (!subject && !body) {
      return;
    }
    const preview = body.length > 120 ? `${body.slice(0, 120)}…` : body;
    const editId = this.editingEmailId();
    if (editId) {
      this.emails.update((emails) =>
        emails.map((e) =>
          e.id === editId
            ? { ...e, date: this.emailForm.date, subject, body, preview }
            : e,
        ),
      );
    } else {
      this.emails.update((emails) => [
        ...emails,
        {
          id: this.nextId('email'),
          date: this.emailForm.date,
          time: this.emailForm.date || '00:00',
          subject: subject || 'Sin asunto',
          preview,
          body,
          expanded: false,
        },
      ]);
    }
    this.emailComposerOpen.set(false);
    this.editingEmailId.set(null);
    this.emailForm = { date: '', subject: '', body: '' };
    this.form.markAsDirty();
  }

  startEditEmail(email: JosanzEventEmail): void {
    this.editingEmailId.set(email.id);
    this.emailForm = { date: email.date, subject: email.subject, body: email.body };
    this.emailComposerOpen.set(true);
  }

  toggleEmail(id: string): void {
    this.emails.update((emails) =>
      emails.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );
  }

  removeEmail(id: string): void {
    this.emails.update((emails) => emails.filter((e) => e.id !== id));
    this.form.markAsDirty();
  }

  // ---------------------------------------------------------------------------
  // Documentos (subir vía modal)
  // ---------------------------------------------------------------------------
  openUploadModal(target: 'inspiration' | 'delivery' | 'invoice' | 'report'): void {
    this.uploadTarget = target;
    this.uploadFileName.set('');
    this.uploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.uploadModalOpen.set(false);
    this.uploadTarget = null;
    this.uploadFileName.set('');
  }

  onUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadFileName.set(file.name);
    }
  }

  confirmUpload(): void {
    const name = this.uploadFileName().trim();
    if (!name || !this.uploadTarget) {
      return;
    }
    const file: JosanzEventFile = { id: this.nextId('file'), name };
    switch (this.uploadTarget) {
      case 'inspiration':
        this.inspirationFiles.update((f) => [...f, file]);
        break;
      case 'delivery':
        this.deliveryNotes.update((f) => [...f, file]);
        break;
      case 'invoice':
        this.invoices.update((f) => [...f, file]);
        break;
      case 'report':
        this.reportFiles.update((f) => [...f, file]);
        break;
    }
    this.form.markAsDirty();
    this.closeUploadModal();
  }

  removeInspirationFile(id: string): void {
    this.inspirationFiles.update((f) => f.filter((file) => file.id !== id));
  }

  removeDeliveryNote(id: string): void {
    this.deliveryNotes.update((f) => f.filter((file) => file.id !== id));
  }

  removeInvoice(id: string): void {
    this.invoices.update((f) => f.filter((file) => file.id !== id));
  }

  removeReport(id: string): void {
    this.reportFiles.update((f) => f.filter((file) => file.id !== id));
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
          this.hydrateNotes(event);
        },
        error: () => this.errorMessage.set('No se pudo cargar el evento.'),
      });
  }

  private hydrateNotes(event: JosanzEventRecord): void {
    const summary = (event.summary ?? '').trim();
    if (summary) {
      this.eventNotes.set(
        summary
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((text) => ({ id: this.nextId('note'), text })),
      );
    }
    const notes = (event.notes ?? '').trim();
    if (notes) {
      this.staffNotes.set(
        notes
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((text) => ({ id: this.nextId('snote'), text })),
      );
    }
  }
}
