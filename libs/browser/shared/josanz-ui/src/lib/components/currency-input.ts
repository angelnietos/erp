import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-currency-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span
        class="flex h-11 w-full items-center overflow-hidden border border-solid"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
      >
        <input
          type="text"
          inputmode="decimal"
          class="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-bold outline-none"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="displayValue"
          [disabled]="disabled"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        <span class="shrink-0 border-l border-solid px-3 text-xs font-black uppercase tracking-wider" [style.borderColor]="'var(--josanz-border)'" [style.color]="'var(--josanz-text-muted)'">{{ currency }}</span>
      </span>
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class CurrencyInputComponent extends JosanzValueAccessorBase<number | null> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Importe';
  @Input() placeholder = '0,00';
  @Input() hint = '';
  @Input() error = '';
  @Input() currency = 'EUR';
  @Input() shape?: JosanzControlShape;

  @Output() valueChange = new EventEmitter<number | null>();

  displayValue = '';

  override writeValue(value: number | null): void {
    if (value === null || Number.isNaN(value)) {
      this.displayValue = '';
      return;
    }
    this.displayValue = value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.displayValue = raw;
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const parsed = normalized === '' ? null : Number(normalized);
    const next = parsed === null || Number.isNaN(parsed) ? null : parsed;
    this.emitChange(next);
    this.valueChange.emit(next);
  }

  onBlur(): void {
    this.markTouched();
    const normalized = this.displayValue.replace(/\./g, '').replace(',', '.');
    const parsed = normalized === '' ? null : Number(normalized);
    if (parsed !== null && !Number.isNaN(parsed)) {
      this.writeValue(parsed);
      this.emitChange(parsed);
    }
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }
}
