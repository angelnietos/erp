import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DeliveryNote, DeliveryNoteService } from '../services/delivery-note.service';

@Injectable({ providedIn: 'root' })
export class DeliveryFacade {
  private readonly service = inject(DeliveryNoteService);

  private readonly _deliveryNotes = signal<DeliveryNote[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly deliveryNotes = this._deliveryNotes.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadDeliveryNotes(force = false): void {
    if (!force && this._deliveryNotes().length > 0) return;
    this._error.set(null);
    this._isLoading.set(true);
    this.service.getDeliveryNotes().subscribe({
      next: (data) => {
        this._deliveryNotes.set(data);
        this._isLoading.set(false);
        this._error.set(null);
      },
      error: () => {
        this._isLoading.set(false);
        this._error.set(
          'No se pudieron cargar los albaranes. Comprueba la conexión e inténtalo de nuevo.',
        );
      },
    });
  }

  searchDeliveryNotes(term: string): void {
    this._isLoading.set(true);
    this.service.searchDeliveryNotes(term).subscribe({
      next: (data) => {
        this._deliveryNotes.set(data);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
    });
  }

  createDeliveryNote(note: Omit<DeliveryNote, 'id'>): Observable<DeliveryNote> {
    return this.service.createDeliveryNote(note).pipe(
      tap((newNote) =>
        this._deliveryNotes.update((notes) => [...notes, newNote]),
      ),
    );
  }

  updateDeliveryNote(
    id: string,
    updates: Partial<DeliveryNote>,
  ): Observable<DeliveryNote> {
    return this.service.updateDeliveryNote(id, updates).pipe(
      tap((updatedNote) =>
        this._deliveryNotes.update((notes) =>
          notes.map((n) => (n.id === id ? updatedNote : n)),
        ),
      ),
    );
  }

  deleteDeliveryNote(id: string): Observable<boolean> {
    return this.service.deleteDeliveryNote(id).pipe(
      tap((success) => {
        if (success) {
          this._deliveryNotes.update((notes) => notes.filter((n) => n.id !== id));
        }
      }),
    );
  }

  signDeliveryNote(
    id: string,
    signature: string,
  ): Observable<DeliveryNote> {
    return this.service.signDeliveryNote(id, signature).pipe(
      tap((updatedNote) =>
        this._deliveryNotes.update((notes) =>
          notes.map((n) => (n.id === id ? updatedNote : n)),
        ),
      ),
    );
  }

  completeDeliveryNote(id: string): Observable<DeliveryNote> {
    return this.service.completeDeliveryNote(id).pipe(
      tap((updatedNote) =>
        this._deliveryNotes.update((notes) =>
          notes.map((n) => (n.id === id ? updatedNote : n)),
        ),
      ),
    );
  }
}
