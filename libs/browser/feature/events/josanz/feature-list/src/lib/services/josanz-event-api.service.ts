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
  createdAt: string;
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
}

export type CreateJosanzEventPayload = UpdateJosanzEventPayload & {
  name: string;
  clientId: string;
  typology: string;
  startDate: string;
};

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
}
