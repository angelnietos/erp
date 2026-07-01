import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventVenueBlock {
  salon?: string;
  subsala?: string;
  setupDate?: string;
  setupTime?: string;
  teardownDate?: string;
  teardownTime?: string;
}

export interface EventDateBlock {
  date: string;
  time?: string;
}

export interface JosanzEventTechnicianRecord {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

export interface JosanzEventAttachmentRecord {
  id: string;
  category: string;
  filename: string;
  storageKey: string | null;
}

export interface JosanzEventBudgetLineRecord {
  id: string;
  units: number;
  materialName: string;
  warehouse: string;
  status: string;
  price: number;
  days: number;
  coef: number;
  discount: number;
}

export interface JosanzEventEmailRecord {
  id: string;
  date: string;
  subject: string;
  body: string;
}

export interface JosanzEventRecord {
  id: string;
  name: string;
  clientId: string | null;
  operatorContactId: string | null;
  typology: string;
  startDate: string;
  endDate: string;
  eventTime: string | null;
  eventSchedule: EventDateBlock[];
  status: string;
  statusPillColor?: string | null;
  location: string | null;
  venueSchedule: EventVenueBlock[];
  notes: string | null;
  summary: string | null;
  budgetAddress: string | null;
  budgetContact: string | null;
  budgetObservations: string | null;
  createdAt: string;
  createdByUserId?: string | null;
  client: {
    id: string;
    name: string;
    sector?: string | null;
    railColor?: string | null;
  } | null;
  operator: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  eventNotes?: { id: string; text: string }[];
  staffNotes?: { id: string; text: string }[];
  technicians?: JosanzEventTechnicianRecord[];
  emails?: JosanzEventEmailRecord[];
  attachments?: JosanzEventAttachmentRecord[];
  budgetLines?: JosanzEventBudgetLineRecord[];
}

export type CreateJosanzEventPayload = UpdateJosanzEventPayload & {
  name: string;
  clientId: string;
  typology: string;
  startDate: string;
};

export interface EventDetailNoteInput {
  kind: 'EVENT' | 'STAFF';
  text: string;
}

export interface EventDetailEmailInput {
  sentAt?: string;
  subject: string;
  body: string;
}

export interface EventDetailAttachmentInput {
  category: 'INSPIRATION' | 'DELIVERY' | 'INVOICE' | 'REPORT';
  filename: string;
  storageKey?: string;
}

export interface EventBudgetLineInput {
  units: number;
  materialName: string;
  warehouse: string;
  status: string;
  price: number;
  days: number;
  coef: number;
  discount: number;
}

export interface UpdateJosanzEventPayload {
  name?: string;
  clientId?: string;
  operatorContactId?: string;
  typology?: string;
  startDate?: string;
  eventTime?: string;
  endDate?: string;
  eventSchedule?: EventDateBlock[];
  location?: string;
  venueSchedule?: EventVenueBlock[];
  status?: string;
  statusPillColor?: string | null;
  notes?: string;
  summary?: string;
  budgetAddress?: string;
  budgetContact?: string;
  budgetObservations?: string;
  technicianIds?: string[];
  detailNotes?: EventDetailNoteInput[];
  emails?: EventDetailEmailInput[];
  attachments?: EventDetailAttachmentInput[];
  budgetLines?: EventBudgetLineInput[];
}

export interface JosanzTechnicianListItem {
  id: string;
  status: string;
  avatarUrl: string | null;
  bio?: string | null;
  skills?: string[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UpdateJosanzTechnicianPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  skills?: string[];
  status?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class JosanzEventApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/events';

  list(clientId?: string): Observable<JosanzEventRecord[]> {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    return this.http.get<JosanzEventRecord[]>(`${this.apiUrl}${query}`);
  }

  getById(id: string): Observable<JosanzEventRecord> {
    return this.http.get<JosanzEventRecord>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateJosanzEventPayload): Observable<JosanzEventRecord> {
    return this.http.post<JosanzEventRecord>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateJosanzEventPayload): Observable<JosanzEventRecord> {
    return this.http.put<JosanzEventRecord>(`${this.apiUrl}/${id}`, payload);
  }

  patchStatus(
    id: string,
    payload: { status: string; statusPillColor?: string | null },
  ): Observable<JosanzEventRecord> {
    return this.http.patch<JosanzEventRecord>(`${this.apiUrl}/${id}/status`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listTechnicians(scope: 'assignable' | 'catalog' = 'assignable'): Observable<JosanzTechnicianListItem[]> {
    const query = scope === 'catalog' ? '?scope=catalog' : '';
    return this.http.get<JosanzTechnicianListItem[]>(`/api/technicians${query}`);
  }

  updateTechnician(
    id: string,
    payload: UpdateJosanzTechnicianPayload,
  ): Observable<JosanzTechnicianListItem> {
    return this.http.patch<JosanzTechnicianListItem>(`/api/technicians/${id}`, payload);
  }
}
