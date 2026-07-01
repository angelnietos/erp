import type { JosanzStatusPillKey } from '@josanz-erp/josanz-ui';

export interface JosanzEventNote {
  id: string;
  text: string;
}

export interface JosanzEventStaffMember {
  id: string;
  optionId: string;
  name: string;
  role: string;
  tag: string;
  pillKey: JosanzStatusPillKey;
  avatarUrl: string;
}

export interface JosanzStaffOption {
  id: string;
  name: string;
  role: string;
  pillKey: JosanzStatusPillKey;
}

export interface JosanzBudgetLine {
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

export interface JosanzBudgetCatalogItem {
  id: string;
  name: string;
  warehouse: string;
  status: string;
  pillKey: JosanzStatusPillKey;
}

export interface JosanzEventFile {
  id: string;
  name: string;
  url?: string;
}

export interface JosanzEventEmail {
  id: string;
  date: string;
  time: string;
  subject: string;
  preview: string;
  body: string;
  expanded: boolean;
}

export type EventComposerId =
  | 'event-note'
  | 'staff-note'
  | 'email'
  | 'staff-picker'
  | 'hero-details';

export type EventAttachmentCategory = 'INSPIRATION' | 'DELIVERY' | 'INVOICE' | 'REPORT';

export type EventUploadTarget = 'inspiration' | 'delivery' | 'invoice' | 'report';

export const UPLOAD_TARGET_TO_CATEGORY: Record<EventUploadTarget, EventAttachmentCategory> = {
  inspiration: 'INSPIRATION',
  delivery: 'DELIVERY',
  invoice: 'INVOICE',
  report: 'REPORT',
};
