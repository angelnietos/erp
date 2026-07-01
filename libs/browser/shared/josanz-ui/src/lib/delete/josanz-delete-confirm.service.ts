import { Injectable, computed, signal } from '@angular/core';
import { finalize, isObservable } from 'rxjs';
import {
  josanzDeleteConfirmCopy,
  type JosanzDeleteConfirmRequest,
} from './josanz-delete-confirm.presets';

@Injectable({ providedIn: 'root' })
export class JosanzDeleteConfirmService {
  private readonly _request = signal<JosanzDeleteConfirmRequest | null>(null);
  private readonly _busy = signal(false);

  readonly busy = this._busy.asReadonly();
  readonly open = computed(() => this._request() !== null);

  readonly dialogCopy = computed(() => {
    const request = this._request();
    if (!request) {
      return null;
    }
    return josanzDeleteConfirmCopy(request.feature, request.itemName);
  });

  ask(request: JosanzDeleteConfirmRequest): void {
    if (this._busy()) {
      return;
    }
    this._request.set(request);
  }

  cancel(): void {
    if (this._busy()) {
      return;
    }
    this._request.set(null);
  }

  confirm(): void {
    const request = this._request();
    if (!request || this._busy()) {
      return;
    }

    const result = request.onConfirm();
    if (isObservable(result)) {
      this._busy.set(true);
      result
        .pipe(
          finalize(() => {
            this._busy.set(false);
            this._request.set(null);
          }),
        )
        .subscribe();
      return;
    }

    this._request.set(null);
  }
}
