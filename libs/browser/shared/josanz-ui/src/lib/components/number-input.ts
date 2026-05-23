import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-number-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span
        class="flex h-11 w-full items-stretch overflow-hidden border border-solid"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
      >
        <button
          type="button"
          class="w-11 border-0 border-r border-solid bg-transparent text-lg font-black"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="accentColor()"
          [disabled]="disabled || value <= min"
          (click)="applyStep(-1)"
        >
          −
        </button>
        <input
          type="number"
          class="min-w-0 flex-1 border-0 bg-transparent px-3 text-center text-sm font-black outline-none"
          [style.color]="'var(--josanz-text)'"
          [min]="min"
          [max]="max"
          [step]="step"
          [value]="value"
          [disabled]="disabled"
          (input)="updateValue($event)"
        />
        <button
          type="button"
          class="w-11 border-0 border-l border-solid bg-transparent text-lg font-black"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="accentColor()"
          [disabled]="disabled || value >= max"
          (click)="applyStep(1)"
        >
          +
        </button>
      </span>
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class NumberInputComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() valueChange = new EventEmitter<number>();

  applyStep(delta: number): void {
    const next = Math.min(this.max, Math.max(this.min, this.value + delta * this.step));
    this.value = next;
    this.valueChange.emit(next);
  }

  updateValue(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    if (Number.isNaN(next)) {
      return;
    }
    this.value = Math.min(this.max, Math.max(this.min, next));
    this.valueChange.emit(this.value);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
