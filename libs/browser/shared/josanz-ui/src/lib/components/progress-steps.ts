import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface JosanzProgressStep {
  id: string;
  label: string;
  description?: string;
  status?: 'complete' | 'current' | 'pending' | 'error';
}

@Component({
  selector: 'josanz-progress-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ol class="m-0 grid list-none gap-0 p-0" [attr.aria-label]="ariaLabel || title || 'Progreso'">
      @for (step of steps; track step.id; let last = $last) {
        <li class="grid grid-cols-[28px_1fr] gap-3">
          <span class="relative flex justify-center">
            <span class="mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-solid text-xs font-black" [ngStyle]="markerStyles(step)"></span>
            @if (!last) {
              <span class="absolute top-7 h-[calc(100%-0.25rem)] w-px" [style.backgroundColor]="'var(--josanz-border)'"></span>
            }
          </span>
          <div class="pb-4">
            <strong class="block text-sm font-black" [style.color]="'var(--josanz-text)'">{{ step.label }}</strong>
            @if (step.description) {
              <span class="mt-0.5 block text-xs" [style.color]="'var(--josanz-text-muted)'">{{ step.description }}</span>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class ProgressStepsComponent {
  @Input() title = '';
  @Input() steps: JosanzProgressStep[] = [];
  @Input() ariaLabel = '';

  markerStyles(step: JosanzProgressStep): Record<string, string> {
    const status = step.status ?? 'pending';
    const color =
      status === 'complete'
        ? 'var(--josanz-success)'
        : status === 'current'
          ? 'var(--josanz-primary)'
          : status === 'error'
            ? 'var(--josanz-danger)'
            : 'var(--josanz-text-muted)';
    const filled = status === 'complete' || status === 'current' || status === 'error';
    return {
      backgroundColor: filled ? color : 'transparent',
      borderColor: filled ? color : 'var(--josanz-border)',
      color: filled ? 'var(--josanz-surface)' : 'var(--josanz-text-muted)',
    };
  }
}
