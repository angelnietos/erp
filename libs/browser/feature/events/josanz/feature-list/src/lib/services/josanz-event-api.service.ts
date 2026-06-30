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

export interface JosanzEventRecord {
  id: string;
  name: string;
  clientId: string | null;
  operatorContactId: string | null;
  typology: string;
  startDate: string;
  endDate: string;
  eventTime: string | null;
  status: string;
  location: string | null;
  venueSchedule: EventVenueBlock[];
  notes: string | null;
  summary: string | null;
  createdAt: string;
  client: { id: string; name: string } | null;
  operator: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface CreateJosanzEventPayload {
  name: string;
  clientId: string;
  operatorContactId?: string;
  typology: string;
  startDate: string;
  eventTime?: string;
  endDate?: string;
  location?: string;
  venueSchedule?: EventVenueBlock[];
  status?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class JosanzEventApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/events';

  list(clientId?: string): Observable<JosanzEventRecord[]> {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    return this.http.get<JosanzEventRecord[]>(`${this.apiUrl}${query}`);
  }

  create(payload: CreateJosanzEventPayload): Observable<JosanzEventRecord> {
    return this.http.post<JosanzEventRecord>(this.apiUrl, payload);
  }
}
