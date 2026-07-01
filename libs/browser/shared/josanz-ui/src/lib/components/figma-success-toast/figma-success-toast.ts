import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/** Toast Figma verde (clientes / eventos) con cierre automático. */
@Component({
  selector: 'josanz-figma-success-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
    <div class="josanz-client-success-toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      {{ message }}
      <button
        type="button"
        class="josanz-client-success-toast__close"
        aria-label="Cerrar"
        (click)="onClose()"
      >
        ×
      </button>
    </div>
    }
  `,
})
export class JosanzFigmaSuccessToastComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input({ required: true }) message = '';
  /** Tiempo visible antes de cerrarse solo (ms). */
  @Input() durationMs = 5000;

  @Output() dismissed = new EventEmitter<void>();

  private autoDismissTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] || changes['message'] || changes['durationMs']) {
      if (this.open) {
        this.scheduleAutoDismiss();
      } else {
        this.clearAutoDismiss();
      }
    }
  }

  ngOnDestroy(): void {
    this.clearAutoDismiss();
  }

  onClose(): void {
    this.clearAutoDismiss();
    this.dismissed.emit();
  }

  private scheduleAutoDismiss(): void {
    this.clearAutoDismiss();
    const duration = Math.max(1500, this.durationMs);
    this.autoDismissTimer = setTimeout(() => this.onClose(), duration);
  }

  private clearAutoDismiss(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = undefined;
    }
  }
}
