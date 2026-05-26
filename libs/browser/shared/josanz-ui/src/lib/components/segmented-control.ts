import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzSegmentedOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-segmented-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex border border-solid p-1"
      [ngClass]="shellClass()"
      [style.backgroundColor]="'var(--josanz-field-fill)'"
      [style.borderColor]="'var(--josanz-border)'"
      role="radiogroup"
      [attr.aria-label]="ariaLabel || label"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="min-w-0 px-3 py-2 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          [ngClass]="itemClass()"
          [disabled]="option.disabled"
          [style.backgroundColor]="
            option.value === value ? accentBackground() : 'transparent'
          "
          [style.color]="
            option.value === value ? accentColor() : 'var(--josanz-text-muted)'
          "
          [attr.aria-checked]="option.value === value"
          role="radio"
          (click)="select(option)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class SegmentedControlComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() options: JosanzSegmentedOption[] = [];
  @Input() value = '';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() optionSelect = new EventEmitter<JosanzSegmentedOption>();

  select(option: JosanzSegmentedOption): void {
    if (option.disabled) {
      return;
    }
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.optionSelect.emit(option);
  }

  shellClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : 'rounded-full';
  }

  itemClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : 'rounded-full';
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  accentBackground(): string {
    return `color-mix(in srgb, ${this.accentColor()} 14%, var(--josanz-surface))`;
  }
}
