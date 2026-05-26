import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';
import { SecondaryButtonComponent } from './secondary-button';

export type JosanzAlertTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'josanz-alert',
  standalone: true,
  imports: [CommonModule, SecondaryButtonComponent],
  template: `
    <section
      class="flex w-full items-start gap-4 border border-solid p-4"
      [ngClass]="cornerClass()"
      [ngStyle]="alertStyles()"
      [attr.role]="tone === 'danger' ? 'alert' : 'status'"
      [attr.aria-label]="ariaLabel || title"
    >
      <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" [ngStyle]="iconStyles()" aria-hidden="true">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          @if (tone === 'success') {
            <path d="M20 6 9 17l-5-5" />
          } @else if (tone === 'warning') {
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          } @else if (tone === 'danger') {
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9 9 15" />
            <path d="m9 9 6 6" />
          } @else {
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          }
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="m-0 text-sm font-black" [style.color]="'var(--josanz-text)'">{{ title }}</h3>
            @if (description) {
              <p class="m-0 mt-1 text-sm leading-relaxed" [style.color]="'var(--josanz-text-muted)'">{{ description }}</p>
            }
          </div>
          @if (dismissible) {
            <button
              type="button"
              class="shrink-0 rounded-full border-0 bg-transparent p-1 text-lg leading-none"
              [style.color]="'var(--josanz-text-muted)'"
              aria-label="Cerrar alerta"
              (click)="dismiss.emit()"
            >
              ×
            </button>
          }
        </div>

        @if (actionLabel) {
          <div class="mt-4">
            <josanz-secondary-button [label]="actionLabel" [shape]="shape" [customColor]="toneColor()" (btnClick)="action.emit()"></josanz-secondary-button>
          </div>
        }
      </div>
    </section>
  `,
})
export class AlertComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() tone: JosanzAlertTone = 'info';
  @Input() title = 'Información';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() dismissible = false;
  @Input() shape?: JosanzControlShape;
  @Input() ariaLabel = '';

  @Output() action = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[28px]';
    }
    return 'rounded-2xl';
  }

  alertStyles(): Record<string, string> {
    const color = this.toneColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 8%, var(--josanz-surface))`,
      borderColor: `color-mix(in srgb, ${color} 22%, var(--josanz-border))`,
    };
  }

  iconStyles(): Record<string, string> {
    const color = this.toneColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      color,
    };
  }

  toneColor(): string {
    if (this.tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (this.tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (this.tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    if (this.tone === 'neutral') {
      return 'var(--josanz-text-muted)';
    }
    return 'var(--josanz-primary)';
  }
}
