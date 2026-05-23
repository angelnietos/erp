import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export type JosanzStepStatus = 'complete' | 'current' | 'pending' | 'error';

export interface JosanzStepperItem {
  id: string;
  label: string;
  description?: string;
  status?: JosanzStepStatus;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav [attr.aria-label]="ariaLabel || 'Progreso'" class="w-full">
      <ol
        class="m-0 grid list-none gap-3 p-0"
        [ngClass]="
          orientation === 'horizontal' ? 'md:grid-flow-col md:auto-cols-fr' : ''
        "
      >
        @for (
          step of items;
          track step.id;
          let index = $index;
          let last = $last
        ) {
          <li class="relative min-w-0">
            <button
              type="button"
              class="flex w-full min-w-0 items-start gap-3 border border-solid bg-transparent p-3 text-left transition-[filter,transform] hover:brightness-[0.98] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              [ngClass]="cornerClass()"
              [ngStyle]="itemStyles(step)"
              [disabled]="step.disabled"
              [attr.aria-current]="
                statusFor(step, index) === 'current' ? 'step' : null
              "
              (click)="selectStep(step)"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-solid text-xs font-black"
                [ngStyle]="markerStyles(step, index)"
                aria-hidden="true"
              >
                @if (statusFor(step, index) === 'complete') {
                  ✓
                } @else if (statusFor(step, index) === 'error') {
                  !
                } @else {
                  {{ index + 1 }}
                }
              </span>
              <span class="min-w-0">
                <span
                  class="block truncate text-sm font-black"
                  [style.color]="'var(--josanz-text)'"
                  >{{ step.label }}</span
                >
                @if (step.description) {
                  <span
                    class="mt-0.5 block truncate text-xs"
                    [style.color]="'var(--josanz-text-muted)'"
                    >{{ step.description }}</span
                  >
                }
              </span>
            </button>
            @if (!last && orientation === 'vertical') {
              <span
                class="ml-7 block h-3 w-px"
                [style.background]="'var(--josanz-border)'"
                aria-hidden="true"
              ></span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StepperComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() items: JosanzStepperItem[] = [];
  @Input() activeId = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() activeIdChange = new EventEmitter<string>();
  @Output() stepSelect = new EventEmitter<JosanzStepperItem>();

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

  itemStyles(step: JosanzStepperItem): Record<string, string> {
    const status = this.statusFor(step, this.items.indexOf(step));
    const atmosphere = this.themeService.currentTheme().atmosphere;
    const color = this.statusColor(status);
    return {
      backgroundColor:
        status === 'current'
          ? `color-mix(in srgb, ${color} 8%, var(--josanz-surface))`
          : atmosphere.surface,
      borderColor:
        status === 'current' || status === 'error' ? color : atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  markerStyles(step: JosanzStepperItem, index: number): Record<string, string> {
    const status = this.statusFor(step, index);
    const color = this.statusColor(status);
    const filled =
      status === 'complete' || status === 'current' || status === 'error';
    return {
      backgroundColor: filled ? color : 'transparent',
      borderColor: filled ? color : 'var(--josanz-border)',
      color: filled ? 'var(--josanz-surface)' : 'var(--josanz-text-muted)',
    };
  }

  statusFor(step: JosanzStepperItem, index: number): JosanzStepStatus {
    if (step.status) {
      return step.status;
    }
    const activeIndex = Math.max(
      0,
      this.items.findIndex((item) => item.id === this.activeId),
    );
    if (index < activeIndex) {
      return 'complete';
    }
    if (index === activeIndex) {
      return 'current';
    }
    return 'pending';
  }

  selectStep(step: JosanzStepperItem): void {
    if (step.disabled) {
      return;
    }
    this.activeId = step.id;
    this.activeIdChange.emit(step.id);
    this.stepSelect.emit(step);
  }

  private statusColor(status: JosanzStepStatus): string {
    if (status === 'complete') {
      return 'var(--josanz-success)';
    }
    if (status === 'error') {
      return 'var(--josanz-danger)';
    }
    if (status === 'pending') {
      return 'var(--josanz-text-muted)';
    }
    return this.customColor || 'var(--josanz-primary)';
  }
}
