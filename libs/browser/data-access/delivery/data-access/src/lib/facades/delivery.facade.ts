import { Injectable, inject, signal } from '@angular/core';
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

  loadDeliveryNotes(): void {
    this._isLoading.set(true);
    this.service.getDeliveryNotes().subscribe({
      next: (data) => {
        this._deliveryNotes.set(data);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err.message || 'Error');
        this._isLoading.set(false);
      }
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

  createDeliveryNote(note: Omit<DeliveryNote, 'id'>): void {
    this.service.createDeliveryNote(note).subscribe({
      next: (newNote) => this._deliveryNotes.update(notes => [...notes, newNote])
    });
  }

  updateDeliveryNote(id: string, updates: Partial<DeliveryNote>): void {
    this.service.updateDeliveryNote(id, updates).subscribe({
      next: (updatedNote) => this._deliveryNotes.update(notes => 
        notes.map(n => n.id === id ? updatedNote : n)
      )
    });
  }

  deleteDeliveryNote(id: string): void {
    this.service.deleteDeliveryNote(id).subscribe({
      next: (success) => {
        if (success) {
          this._deliveryNotes.update(notes => notes.filter(n => n.id !== id));
        }
      }
    });
  }

  signDeliveryNote(id: string, signature: string): void {
    this.service.signDeliveryNote(id, signature).subscribe({
      next: (updatedNote) => this._deliveryNotes.update(notes => 
        notes.map(n => n.id === id ? updatedNote : n)
      )
    });
  }

  completeDeliveryNote(id: string): void {
    this.service.completeDeliveryNote(id).subscribe({
      next: (updatedNote) => this._deliveryNotes.update(notes => 
        notes.map(n => n.id === id ? updatedNote : n)
      )
    });
  }
}
