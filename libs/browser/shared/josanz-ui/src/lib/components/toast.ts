import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

export type JosanzToastTone = 'info' | 'success' | 'warning' | 'danger';
export type JosanzToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export interface JosanzToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: JosanzToastTone;
  actionLabel?: string;
  durationMs?: number;
  persistent?: boolean;
}

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
            @if (toast.actionLabel) {
              <button
                type="button"
                class="mt-3 rounded-full border border-solid bg-transparent px-3 py-1 text-xs font-black"
                [style.borderColor]="'var(--josanz-border)'"
                [style.color]="toneColor(toast.tone ?? 'info')"
                (click)="action(toast)"
              >
                {{ toast.actionLabel }}
              </button>
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
export class ToastComponent implements OnChanges, OnDestroy {
  @Input() toasts: JosanzToastItem[] = [];
  @Input() position: JosanzToastPosition = 'top-right';
  @Input() dismissible = true;
  @Input() limit = 4;
  @Input() ariaLabel = '';
  @Input() autoDismiss = false;
  @Input() defaultDurationMs = 5000;

  @Output() toastDismiss = new EventEmitter<string>();
  @Output() toastAction = new EventEmitter<JosanzToastItem>();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toasts'] || changes['autoDismiss'] || changes['defaultDurationMs']) {
      this.syncTimers();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  visibleToasts(): JosanzToastItem[] {
    return this.toasts.slice(0, Math.max(1, this.limit));
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    this.toastDismiss.emit(id);
  }

  action(toast: JosanzToastItem): void {
    this.toastAction.emit(toast);
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

  toneColor(tone: JosanzToastTone): string {
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

  private syncTimers(): void {
    if (!this.autoDismiss) {
      this.clearTimers();
      return;
    }
    const visibleIds = new Set(this.visibleToasts().map((toast) => toast.id));
    for (const id of Array.from(this.timers.keys())) {
      if (!visibleIds.has(id)) {
        this.clearTimer(id);
      }
    }
    for (const toast of this.visibleToasts()) {
      if (toast.persistent || this.timers.has(toast.id)) {
        continue;
      }
      const duration = Math.max(1000, toast.durationMs ?? this.defaultDurationMs);
      this.timers.set(
        toast.id,
        setTimeout(() => this.dismiss(toast.id), duration),
      );
    }
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private clearTimers(): void {
    for (const id of Array.from(this.timers.keys())) {
      this.clearTimer(id);
    }
  }
}
