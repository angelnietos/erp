import { Injectable, signal } from '@angular/core';

export type GcrmToastVariant = 'success' | 'error' | 'info';

export interface GcrmToastItem {
  id: string;
  message: string;
  variant: GcrmToastVariant;
}

@Injectable({ providedIn: 'root' })
export class GcrmToastService {
  private readonly items = signal<GcrmToastItem[]>([]);
  readonly toasts = this.items.asReadonly();

  success(message: string, durationMs = 4500): void {
    this.push(message, 'success', durationMs);
  }

  error(message: string, durationMs = 6500): void {
    this.push(message, 'error', durationMs);
  }

  info(message: string, durationMs = 4500): void {
    this.push(message, 'info', durationMs);
  }

  dismiss(id: string): void {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }

  private push(
    message: string,
    variant: GcrmToastVariant,
    durationMs: number,
  ): void {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.items.update((list) => [...list, { id, message, variant }]);
    window.setTimeout(() => this.dismiss(id), durationMs);
  }
}
