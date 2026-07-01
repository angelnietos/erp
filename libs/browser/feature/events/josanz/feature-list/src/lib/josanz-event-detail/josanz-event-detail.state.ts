import { Injectable, computed, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import type { JosanzStatusPillKey } from '@josanz-erp/josanz-ui';
import type { JosanzEventRecord } from '../services/josanz-event-api.service';
import type { JosanzEventUiType } from '../josanz-event-form.utils';
import { buildEventDetailSavePayload, mapTechnicianRoleToPill } from './josanz-event-detail.payload';
import type {
  EventComposerId,
  EventUploadTarget,
  JosanzBudgetCatalogItem,
  JosanzBudgetLine,
  JosanzEventEmail,
  JosanzEventFile,
  JosanzEventNote,
  JosanzEventStaffMember,
  JosanzStaffOption,
} from './josanz-event-detail.types';

const DEFAULT_BUDGET_OBSERVATIONS =
  'La jornada del técnico es de 8h (+1 hora para comer). El coste de la hora extra del técnico es de 35€/hora (IVA no incluido).';

@Injectable()
export class JosanzEventDetailState {
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

  readonly staffCatalog = signal<JosanzStaffOption[]>([]);

  readonly activeComposer = signal<EventComposerId | null>(null);
  readonly eventNotes = signal<JosanzEventNote[]>([]);
  readonly staffNotes = signal<JosanzEventNote[]>([]);
  readonly inspirationFiles = signal<JosanzEventFile[]>([]);
  readonly staffMembers = signal<JosanzEventStaffMember[]>([]);
  readonly deliveryNotes = signal<JosanzEventFile[]>([]);
  readonly invoices = signal<JosanzEventFile[]>([]);
  readonly reportFiles = signal<JosanzEventFile[]>([]);
  readonly emails = signal<JosanzEventEmail[]>([]);
  readonly budgetLines = signal<JosanzBudgetLine[]>([]);

  budgetSearch = '';
  readonly showBudgetPicker = signal(false);
  readonly highlightedBudgetId = signal('');
  budgetObservations = DEFAULT_BUDGET_OBSERVATIONS;
  budgetAddress = '';
  budgetContact = '';

  noteDraft = '';
  editingNoteId = signal<string | null>(null);
  editingNoteText = '';
  staffPickerEditingId = signal<string | null>(null);

  emailForm = { date: '', subject: '', body: '' };
  editingEmailId = signal<string | null>(null);

  readonly uploadModalOpen = signal(false);
  private uploadTarget: EventUploadTarget | null = null;
  readonly uploadFileName = signal('');

  readonly staffOptions = computed(() =>
    this.staffCatalog().map((s) => ({ label: `${s.name} · ${s.role}`, value: s.id })),
  );

  readonly budgetSubtotal = computed(() =>
    this.budgetLines().reduce((sum, line) => sum + this.budgetLineTotal(line), 0),
  );
  readonly budgetTax = computed(() => Math.round(this.budgetSubtotal() * 0.21 * 100) / 100);
  readonly budgetTotal = computed(() =>
    Math.round((this.budgetSubtotal() + this.budgetTax()) * 100) / 100,
  );

  private markDirty: (() => void) | null = null;

  bindForm(markDirty: () => void): void {
    this.markDirty = markDirty;
  }

  isComposerOpen(id: EventComposerId): boolean {
    return this.activeComposer() === id;
  }

  toggleComposer(id: EventComposerId): void {
    const closing = this.activeComposer() === id;
    this.activeComposer.set(closing ? null : id);
    if (id === 'event-note' || id === 'staff-note') {
      this.noteDraft = '';
      this.editingNoteId.set(null);
    }
    if (id === 'email') {
      this.editingEmailId.set(null);
      this.emailForm = { date: '', subject: '', body: '' };
    }
    if (id === 'staff-picker') {
      this.staffPickerEditingId.set(null);
    }
  }

  closeComposer(): void {
    this.activeComposer.set(null);
    this.noteDraft = '';
    this.editingNoteId.set(null);
    this.staffPickerEditingId.set(null);
  }

  toggleHeroDetails(): void {
    this.toggleComposer('hero-details');
  }

  hydrateFromRecord(record: JosanzEventRecord): void {
    this.eventNotes.set((record.eventNotes ?? []).map((n) => ({ id: n.id, text: n.text })));
    this.staffNotes.set((record.staffNotes ?? []).map((n) => ({ id: n.id, text: n.text })));
    this.staffMembers.set(
      (record.technicians ?? []).map((t) => ({
        id: t.id,
        optionId: t.id,
        name: t.name,
        role: t.role,
        tag: t.role,
        pillKey: mapTechnicianRoleToPill(t.role),
        avatarUrl: t.avatarUrl ?? '',
      })),
    );
    this.emails.set(
      (record.emails ?? []).map((e) => ({
        id: e.id,
        date: e.date,
        time: e.date || '00:00',
        subject: e.subject,
        body: e.body,
        preview: e.body.length > 120 ? `${e.body.slice(0, 120)}…` : e.body,
        expanded: false,
      })),
    );

    const attachments = record.attachments ?? [];
    this.inspirationFiles.set(
      attachments.filter((a) => a.category === 'INSPIRATION').map((a) => ({ id: a.id, name: a.filename })),
    );
    this.deliveryNotes.set(
      attachments.filter((a) => a.category === 'DELIVERY').map((a) => ({ id: a.id, name: a.filename })),
    );
    this.invoices.set(
      attachments.filter((a) => a.category === 'INVOICE').map((a) => ({ id: a.id, name: a.filename })),
    );
    this.reportFiles.set(
      attachments.filter((a) => a.category === 'REPORT').map((a) => ({ id: a.id, name: a.filename })),
    );

    this.budgetLines.set(
      (record.budgetLines ?? []).map((line) => ({
        id: line.id,
        units: line.units,
        itemId: '',
        name: line.materialName,
        warehouse: line.warehouse,
        status: line.status,
        pillKey: this.statusToPillKey(line.status),
        price: line.price,
        days: line.days,
        coef: line.coef,
        discount: line.discount,
      })),
    );
    this.budgetAddress = record.budgetAddress ?? '';
    this.budgetContact = record.budgetContact ?? '';
    this.budgetObservations = record.budgetObservations ?? DEFAULT_BUDGET_OBSERVATIONS;
  }

  setStaffCatalogFromApi(
    technicians: Array<{
      id: string;
      status: string;
      user: { firstName: string; lastName: string };
    }>,
  ): void {
    this.staffCatalog.set(
      technicians.map((t) => {
        const name = `${t.user.firstName} ${t.user.lastName}`.trim();
        const role = t.status === 'ACTIVE' ? 'Técnico' : t.status;
        return {
          id: t.id,
          name,
          role,
          pillKey: mapTechnicianRoleToPill(role),
        };
      }),
    );
  }

  buildSavePayload(form: FormGroup, selectedType: JosanzEventUiType) {
    return buildEventDetailSavePayload({
      form,
      selectedType,
      eventNotes: this.eventNotes(),
      staffNotes: this.staffNotes(),
      staffMembers: this.staffMembers(),
      emails: this.emails(),
      inspirationFiles: this.inspirationFiles(),
      deliveryNotes: this.deliveryNotes(),
      invoices: this.invoices(),
      reportFiles: this.reportFiles(),
      budgetLines: this.budgetLines(),
      budgetAddress: this.budgetAddress,
      budgetContact: this.budgetContact,
      budgetObservations: this.budgetObservations,
    });
  }

  // --- Notes (event + staff) ---
  addNote(kind: 'event' | 'staff'): void {
    const text = this.noteDraft.trim();
    if (!text) {
      return;
    }
    const note = { id: this.nextId('note'), text };
    if (kind === 'event') {
      this.eventNotes.update((notes) => [...notes, note]);
    } else {
      this.staffNotes.update((notes) => [...notes, note]);
    }
    this.closeComposer();
    this.dirty();
  }

  startEditNote(note: JosanzEventNote): void {
    this.editingNoteId.set(note.id);
    this.editingNoteText = note.text;
    this.activeComposer.set(null);
  }

  saveNote(kind: 'event' | 'staff', id: string): void {
    const text = this.editingNoteText.trim();
    const target = kind === 'event' ? this.eventNotes : this.staffNotes;
    if (!text) {
      this.removeNote(kind, id);
      return;
    }
    target.update((notes) => notes.map((n) => (n.id === id ? { ...n, text } : n)));
    this.editingNoteId.set(null);
    this.dirty();
  }

  cancelEditNote(): void {
    this.editingNoteId.set(null);
  }

  removeNote(kind: 'event' | 'staff', id: string): void {
    const target = kind === 'event' ? this.eventNotes : this.staffNotes;
    target.update((notes) => notes.filter((n) => n.id !== id));
    if (this.editingNoteId() === id) {
      this.editingNoteId.set(null);
    }
    this.dirty();
  }

  notesFor(kind: 'event' | 'staff'): JosanzEventNote[] {
    return kind === 'event' ? this.eventNotes() : this.staffNotes();
  }

  composerIdFor(kind: 'event' | 'staff'): EventComposerId {
    return kind === 'event' ? 'event-note' : 'staff-note';
  }

  // --- Staff ---
  openStaffPicker(editId: string | null = null): void {
    this.staffPickerEditingId.set(editId);
    this.activeComposer.set('staff-picker');
  }

  onStaffPicked(optionId: string): void {
    const option = this.staffCatalog().find((s) => s.id === optionId);
    if (!option) {
      return;
    }
    const editId = this.staffPickerEditingId();
    if (editId) {
      this.staffMembers.update((members) =>
        members.map((m) =>
          m.id === editId
            ? {
                ...m,
                optionId: option.id,
                name: option.name,
                role: option.role,
                tag: option.role,
                pillKey: option.pillKey,
              }
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
    this.closeComposer();
    this.dirty();
  }

  removeStaffMember(id: string): void {
    this.staffMembers.update((members) => members.filter((m) => m.id !== id));
    this.dirty();
  }

  // --- Budget ---
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
    this.dirty();
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
    this.dirty();
  }

  updateBudgetLine(lineId: string, field: keyof JosanzBudgetLine, value: string): void {
    const num = Number(value.replace(',', '.'));
    this.budgetLines.update((lines) =>
      lines.map((line) =>
        line.id === lineId ? { ...line, [field]: Number.isFinite(num) ? num : 0 } : line,
      ),
    );
    this.dirty();
  }

  removeBudgetLine(lineId: string): void {
    this.budgetLines.update((lines) => lines.filter((line) => line.id !== lineId));
    this.dirty();
  }

  budgetLineTotal(line: JosanzBudgetLine): number {
    const base = line.units * line.price * (line.days || 1) * (line.coef || 1);
    const discounted = base * (1 - (line.discount || 0) / 100);
    return Math.round(discounted * 100) / 100;
  }

  formatCurrency(value: number): string {
    return `€ ${value.toFixed(2)}`;
  }

  touchBudgetFields(): void {
    this.dirty();
  }

  pillStyle(key: JosanzStatusPillKey): Record<string, string> {
    return {
      backgroundColor: `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  // --- Emails ---
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
          e.id === editId ? { ...e, date: this.emailForm.date, subject, body, preview } : e,
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
    this.closeComposer();
    this.editingEmailId.set(null);
    this.emailForm = { date: '', subject: '', body: '' };
    this.dirty();
  }

  startEditEmail(email: JosanzEventEmail): void {
    this.editingEmailId.set(email.id);
    this.emailForm = { date: email.date, subject: email.subject, body: email.body };
    this.activeComposer.set('email');
  }

  toggleEmail(id: string): void {
    this.emails.update((emails) =>
      emails.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );
  }

  removeEmail(id: string): void {
    this.emails.update((emails) => emails.filter((e) => e.id !== id));
    this.dirty();
  }

  // --- Upload ---
  openUploadModal(target: EventUploadTarget): void {
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
    this.dirty();
    this.closeUploadModal();
  }

  removeFile(target: EventUploadTarget, id: string): void {
    const map = {
      inspiration: this.inspirationFiles,
      delivery: this.deliveryNotes,
      invoice: this.invoices,
      report: this.reportFiles,
    } as const;
    map[target].update((files) => files.filter((f) => f.id !== id));
    this.dirty();
  }

  private statusToPillKey(status: string): JosanzStatusPillKey {
    const s = status.toLowerCase();
    if (s.includes('dispon')) {
      return 'confirmado';
    }
    if (s.includes('aver') || s.includes('rechaz')) {
      return 'cancelado';
    }
    return 'en-proceso';
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private dirty(): void {
    this.markDirty?.();
  }
}
