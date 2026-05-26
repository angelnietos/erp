import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <input
        type="date"
        class="h-11 w-full border border-solid bg-transparent px-4 text-sm font-semibold outline-none"
        [ngClass]="cornerClass()"
        [value]="value"
        [min]="min"
        [max]="max"
        [disabled]="disabled"
        [attr.aria-label]="ariaLabel || label || 'Seleccionar fecha'"
        [ngStyle]="inputStyles()"
        (input)="onInput($event)"
        (blur)="markTouched()"
      />
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class DatePickerComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Fecha';
  @Input() value = '';
  @Input() min = '';
  @Input() max = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
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

  inputStyles(): Record<string, string> {
    const accent = this.customColor || 'var(--josanz-primary)';
    return {
      color: 'var(--josanz-text)',
      backgroundColor: 'var(--josanz-field-fill)',
      borderColor: this.error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)',
      boxShadow: `0 0 0 0 ${accent}`,
    };
  }
}
