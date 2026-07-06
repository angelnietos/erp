import type { FormGroup } from '@angular/forms';
import type { UpdateJosanzEventPayload } from '@josanz-erp/josanz-events-data-access';
import { buildJosanzEventPayload } from '../utils/josanz-event-form.helpers';
import type { JosanzEventUiType } from '../utils/josanz-event-form.utils';
import type {
  JosanzBudgetLine,
  JosanzEventEmail,
  JosanzEventFile,
  JosanzEventNote,
  JosanzEventStaffMember,
} from './josanz-event-detail.types';

interface DetailPayloadInput {
  form: FormGroup;
  selectedType: JosanzEventUiType;
  eventNotes: JosanzEventNote[];
  staffNotes: JosanzEventNote[];
  staffMembers: JosanzEventStaffMember[];
  emails: JosanzEventEmail[];
  inspirationFiles: JosanzEventFile[];
  deliveryNotes: JosanzEventFile[];
  invoices: JosanzEventFile[];
  reportFiles: JosanzEventFile[];
  budgetLines: JosanzBudgetLine[];
  budgetAddress: string;
  budgetContact: string;
  budgetObservations: string;
}

export function buildEventDetailSavePayload(input: DetailPayloadInput): UpdateJosanzEventPayload {
  const base = buildJosanzEventPayload(input.form, input.selectedType);

  return {
    ...base,
    detailNotes: [
      ...input.eventNotes.map((n) => ({ kind: 'EVENT' as const, text: n.text })),
      ...input.staffNotes.map((n) => ({ kind: 'STAFF' as const, text: n.text })),
    ],
    technicianIds: input.staffMembers.map((m) => m.optionId),
    emails: input.emails.map((e) => ({
      sentAt: e.date || undefined,
      subject: e.subject,
      body: e.body,
    })),
    attachments: [
      ...input.inspirationFiles.map((f) => ({
        category: 'INSPIRATION' as const,
        filename: f.name,
        storageKey: f.url,
      })),
      ...input.deliveryNotes.map((f) => ({
        category: 'DELIVERY' as const,
        filename: f.name,
        storageKey: f.url,
      })),
      ...input.invoices.map((f) => ({
        category: 'INVOICE' as const,
        filename: f.name,
        storageKey: f.url,
      })),
      ...input.reportFiles.map((f) => ({
        category: 'REPORT' as const,
        filename: f.name,
        storageKey: f.url,
      })),
    ],
    budgetLines: input.budgetLines.map((line) => ({
      units: line.units,
      materialName: line.name,
      warehouse: line.warehouse,
      status: line.status,
      price: line.price,
      days: line.days,
      coef: line.coef,
      discount: line.discount,
    })),
    budgetAddress: input.budgetAddress || undefined,
    budgetContact: input.budgetContact || undefined,
    budgetObservations: input.budgetObservations || undefined,
  };
}

export function mapTechnicianRoleToPill(status: string): 'staff-tecnico' | 'staff-practicas' | 'staff-freelance' | 'superadmin' | 'admin' {
  const normalized = status.toUpperCase();
  if (normalized.includes('PRACT')) {
    return 'staff-practicas';
  }
  if (normalized.includes('FREE')) {
    return 'staff-freelance';
  }
  if (normalized === 'OFFICE_SUPERADMIN') {
    return 'superadmin';
  }
  if (normalized === 'OFFICE_ADMIN' || normalized === 'OFFICE_RESPONSABLE') {
    return 'admin';
  }
  if (normalized.startsWith('OFFICE_')) {
    return 'staff-tecnico';
  }
  return 'staff-tecnico';
}
