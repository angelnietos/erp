import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

export interface JosanzSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
          >{{ label }}</span
        >
      }
      <div class="relative">
        <select
          class="h-11 w-full appearance-none border border-solid px-4 pr-10 text-sm font-bold outline-none transition-all"
          [ngClass]="cornerClass()"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="
            isFocused || customColor
              ? accentColor
              : 'var(--josanz-stroke-field)'
          "
          [style.boxShadow]="isFocused ? focusRing() : 'none'"
          [style.color]="'var(--josanz-text)'"
          [value]="value"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label"
          (focus)="isFocused = true"
          (blur)="onBlur()"
          (change)="selectValue($event)"
        >
          @if (placeholder) {
            <option value="" [disabled]="required">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [disabled]="option.disabled">
              {{ option.label }}
            </option>
          }
        </select>
        <span
          class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          [style.color]="'var(--josanz-text-muted)'"
          aria-hidden="true"
          >⌄</span
        >
      </div>
      @if (hint || error) {
        <span
          class="text-xs"
          [style.color]="
            error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'
          "
          >{{ error || hint }}</span
        >
      }
    </label>
  `,
})
export class SelectComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: JosanzSelectOption[] = [];
  @Input() value = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() override disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  isFocused = false;

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  get accentColor(): string {
    return this.customColor || 'var(--josanz-interactive)';
  }

  onBlur(): void {
    this.isFocused = false;
    this.markTouched();
  }

  selectValue(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.emitChange(this.value);
    this.valueChange.emit(this.value);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-full';
    }
    return 'rounded-[var(--josanz-radius-control)]';
  }

  focusRing(): string {
    return `0 0 0 2px color-mix(in srgb, ${this.accentColor} 35%, transparent)`;
  }
}
