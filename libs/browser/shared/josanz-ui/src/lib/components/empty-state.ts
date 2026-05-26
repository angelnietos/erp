import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';
import { ButtonComponent } from './button';
import { SecondaryButtonComponent } from './secondary-button';

export type JosanzEmptyStateIcon = 'search' | 'documents' | 'users' | 'calendar' | 'error' | 'inbox';

@Component({
  selector: 'josanz-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SecondaryButtonComponent],
  template: `
    <section
      class="mx-auto flex w-full max-w-[720px] flex-col items-center border border-solid px-6 py-10 text-center md:px-10 md:py-12"
      [ngClass]="cornerClass()"
      [ngStyle]="shellStyles()"
      [attr.aria-label]="ariaLabel || title"
    >
      <div
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-solid"
        [ngStyle]="iconShellStyles()"
        aria-hidden="true"
      >
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          @switch (icon) {
            @case ('documents') {
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h6" />
            }
            @case ('users') {
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            }
            @case ('calendar') {
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            }
            @case ('error') {
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            }
            @case ('inbox') {
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            }
            @default {
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            }
          }
        </svg>
      </div>

      @if (eyebrow) {
        <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" [style.color]="'var(--josanz-text-muted)'">
          {{ eyebrow }}
        </p>
      }
      <h2 class="m-0 mt-2 text-2xl font-black tracking-tight" [style.color]="'var(--josanz-text)'">
        {{ title }}
      </h2>
      @if (description) {
        <p class="m-0 mt-3 max-w-xl text-sm leading-relaxed" [style.color]="'var(--josanz-text-muted)'">
          {{ description }}
        </p>
      }

      @if (primaryLabel || secondaryLabel) {
        <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
          @if (secondaryLabel) {
            <josanz-secondary-button
              [label]="secondaryLabel"
              type="cancel"
              [shape]="shape"
              [customColor]="customColor"
              (btnClick)="secondaryAction.emit()"
            ></josanz-secondary-button>
          }
          @if (primaryLabel) {
            <josanz-button
              [label]="primaryLabel"
              [shape]="shape"
              [customColor]="customColor"
              [showIcon]="showPrimaryIcon"
              (btnClick)="primaryAction.emit()"
            ></josanz-button>
          }
        </div>
      }
    </section>
  `,
})
export class EmptyStateComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() eyebrow = '';
  @Input() title = 'Sin resultados';
  @Input() description = '';
  @Input() icon: JosanzEmptyStateIcon = 'inbox';
  @Input() primaryLabel = '';
  @Input() secondaryLabel = '';
  @Input() showPrimaryIcon = true;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[36px]';
    }
    return 'rounded-3xl';
  }

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  iconShellStyles(): Record<string, string> {
    const color = this.customColor || 'var(--josanz-primary)';
    return {
      backgroundColor: `color-mix(in srgb, ${color} 12%, var(--josanz-surface))`,
      borderColor: `color-mix(in srgb, ${color} 24%, var(--josanz-border))`,
      color,
    };
  }
}
