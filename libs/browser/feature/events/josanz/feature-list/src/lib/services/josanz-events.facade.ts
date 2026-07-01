import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import {
  JosanzEventApiService,
  type CreateJosanzEventPayload,
  type JosanzEventRecord,
  type UpdateJosanzEventPayload,
} from './josanz-event-api.service';

@Injectable({ providedIn: 'root' })
export class JosanzEventsFacade {
  private readonly api = inject(JosanzEventApiService);

  private readonly _events = signal<JosanzEventRecord[]>([]);
  private readonly _eventDetailsById = signal<Record<string, JosanzEventRecord>>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _hasCache = signal(false);

  readonly events = computed(() => this._events());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly hasCache = computed(() => this._hasCache());

  loadEvents(): void {
    if (this._hasCache()) {
      this.refreshEvents();
      return;
    }
    this.fetchEvents();
  }

  refreshEvents(): void {
    this.fetchEvents();
  }

  ensureEvent(id: string): Observable<JosanzEventRecord | null> {
    const cachedDetail = this._eventDetailsById()[id];
    if (cachedDetail) {
      this.api.getById(id).subscribe({
        next: (event) => this.upsertEvent(event),
        error: () => undefined,
      });
      return of(cachedDetail);
    }

    const cachedListRow = this._events().find((event) => event.id === id);
    if (cachedListRow) {
      this.api.getById(id).subscribe({
        next: (event) => this.upsertEvent(event),
        error: () => undefined,
      });
      return of(cachedListRow);
    }

    this._loading.set(true);
    this._error.set(null);
    return this.api.getById(id).pipe(
      tap((event) => this.upsertEvent(event)),
      map((event) => event ?? null),
      catchError(() => {
        this._error.set('No se pudo cargar el evento.');
        return of(null);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  createEvent(payload: CreateJosanzEventPayload): Observable<JosanzEventRecord> {
    return this.api.create(payload).pipe(tap((event) => this.upsertEvent(event)));
  }

  updateEvent(id: string, payload: UpdateJosanzEventPayload): Observable<JosanzEventRecord> {
    return this.api.update(id, payload).pipe(tap((event) => this.upsertEvent(event)));
  }

  deleteEvent$(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.removeEventFromCache(id)));
  }

  upsertEvent(event: JosanzEventRecord): void {
    this._eventDetailsById.update((byId) => ({ ...byId, [event.id]: event }));
    this._events.update((events) => {
      const exists = events.some((row) => row.id === event.id);
      if (exists) {
        return events.map((row) => (row.id === event.id ? { ...row, ...event } : row));
      }
      return [event, ...events];
    });
    this._hasCache.set(true);
  }

  removeEventFromCache(id: string): void {
    this._events.update((events) => events.filter((event) => event.id !== id));
    this._eventDetailsById.update((byId) => {
      const next = { ...byId };
      delete next[id];
      return next;
    });
  }

  private fetchEvents(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .list()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (events) => {
          this._events.set(events);
          this._eventDetailsById.update((byId) => {
            const next = { ...byId };
            for (const event of events) {
              next[event.id] = { ...next[event.id], ...event };
            }
            return next;
          });
          this._hasCache.set(true);
        },
        error: () => this._error.set('No se pudieron cargar los eventos.'),
      });
  }
}
