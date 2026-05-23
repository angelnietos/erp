import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type JosanzToastTone = 'info' | 'success' | 'warning' | 'danger';
export type JosanzToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

@Component({
  selector: 'josanz-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside
      class="pointer-events-none fixed z-50 grid gap-3"
      [ngClass]="positionClass()"
      [attr.aria-label]="ariaLabel || 'Notificaciones'"
    >
      @for (toast of visibleToasts(); track toast.id) {
        <article
          class="pointer-events-auto flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border border-solid p-4 shadow-xl"
          [ngStyle]="toastStyles(toast.tone)"
          role="status"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            [ngStyle]="iconStyles(toast.tone)"
            aria-hidden="true"
          >
            @if (toast.tone === 'success') {
              OK
            } @else if (toast.tone === 'danger') {
              !
            } @else if (toast.tone === 'warning') {
              !
            } @else {
              i
            }
          </span>
          <span class="min-w-0 flex-1">
            <strong
              class="block text-sm font-black"
              [style.color]="'var(--josanz-text)'"
              >{{ toast.title }}</strong
            >
            @if (toast.description) {
              <span
                class="mt-1 block text-sm leading-relaxed"
                [style.color]="'var(--josanz-text-muted)'"
                >{{ toast.description }}</span
              >
            }
          </span>
          @if (dismissible) {
            <button
              type="button"
              class="rounded-full border-0 bg-transparent p-1 text-lg leading-none"
              [style.color]="'var(--josanz-text-muted)'"
              aria-label="Cerrar notificación"
              (click)="dismiss(toast.id)"
            >
              ×
            </button>
          }
        </article>
      }
    </aside>
  `,
})
export class ToastComponent {
  @Input() toasts: Array<{
    id: string;
    title: string;
    description?: string;
    tone?: JosanzToastTone;
  }> = [];
  @Input() position: JosanzToastPosition = 'top-right';
  @Input() dismissible = true;
  @Input() limit = 4;
  @Input() ariaLabel = '';

  @Output() toastDismiss = new EventEmitter<string>();

  visibleToasts(): Array<{
    id: string;
    title: string;
    description?: string;
    tone?: JosanzToastTone;
  }> {
    return this.toasts.slice(0, Math.max(1, this.limit));
  }

  dismiss(id: string): void {
    this.toastDismiss.emit(id);
  }

  positionClass(): string {
    if (this.position === 'top-left') {
      return 'left-4 top-4';
    }
    if (this.position === 'bottom-left') {
      return 'bottom-4 left-4';
    }
    if (this.position === 'bottom-right') {
      return 'bottom-4 right-4';
    }
    return 'right-4 top-4';
  }

  toastStyles(tone: JosanzToastTone = 'info'): Record<string, string> {
    const color = this.toneColor(tone);
    return {
      backgroundColor: 'var(--josanz-surface)',
      borderColor: `color-mix(in srgb, ${color} 28%, var(--josanz-border))`,
    };
  }

  iconStyles(tone: JosanzToastTone = 'info'): Record<string, string> {
    const color = this.toneColor(tone);
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      color,
    };
  }

  private toneColor(tone: JosanzToastTone): string {
    if (tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    return 'var(--josanz-primary)';
  }
}
