import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(
    message: string,
    variant: ToastVariant = 'info',
    durationMs = 4500,
  ): void {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `t-${Date.now()}`;
    this._toasts.update((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: string): void {
    this._toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
