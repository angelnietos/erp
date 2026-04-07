import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

export interface DomainEventApiDto {
  id: string;
  tenantId: string;
  occurredAt: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class DomainEventsApiService {
  private readonly http = inject(HttpClient);

  list(limit = 100): Observable<DomainEventApiDto[]> {
    return this.http
      .get<DomainEventApiDto[]>(`/api/domain-events?limit=${limit}`)
      .pipe(catchError(() => of([])));
  }

  append(event: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload?: Record<string, unknown>;
  }): Observable<DomainEventApiDto | null> {
    return this.http
      .post<DomainEventApiDto>('/api/domain-events', event)
      .pipe(catchError(() => of(null)));
  }
}
