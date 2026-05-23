import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="inline-flex cursor-pointer items-start gap-3"
      [class.opacity-60]="disabled"
    >
      <span
        class="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-solid"
        [ngClass]="cornerClass()"
        [ngStyle]="boxStyles()"
      >
        <input
          class="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          type="checkbox"
          [checked]="checked"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label"
          (change)="toggle($event)"
          (blur)="markTouched()"
        />
        @if (checked) {
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
      </span>
      <span class="min-w-0">
        <span
          class="block text-sm font-bold"
          [style.color]="'var(--josanz-text)'"
          >{{ label }}</span
        >
        @if (description) {
          <span
            class="mt-0.5 block text-xs"
            [style.color]="'var(--josanz-text-muted)'"
            >{{ description }}</span
          >
        }
      </span>
    </label>
  `,
})
export class CheckboxComponent extends JosanzValueAccessorBase<boolean> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Checkbox';
  @Input() description = '';
  @Input() checked = false;
  @Input() override disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  override writeValue(value: boolean | null): void {
    this.checked = !!value;
  }

  toggle(event: Event): void {
    if (this.disabled) {
      return;
    }
    this.checked = (event.target as HTMLInputElement).checked;
    this.emitChange(this.checked);
    this.checkedChange.emit(this.checked);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-md';
    }
    return 'rounded-[6px]';
  }

  boxStyles(): Record<string, string> {
    const color = this.customColor || 'var(--josanz-primary)';
    return {
      backgroundColor: this.checked ? color : 'var(--josanz-field-fill)',
      borderColor: this.checked ? color : 'var(--josanz-stroke-field)',
      color: this.checked ? 'var(--josanz-surface)' : 'var(--josanz-text)',
    };
  }
}
