import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-phone-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span
        class="flex h-11 w-full overflow-hidden border border-solid"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
      >
        <select
          class="h-full border-0 border-r border-solid bg-transparent px-2 text-xs font-black outline-none"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-text)'"
          [disabled]="disabled"
          [value]="countryCode"
          (change)="onPrefixChange($event)"
        >
          @for (prefix of prefixes; track prefix.code) {
            <option [value]="prefix.code">{{ prefix.label }}</option>
          }
        </select>
        <input
          type="tel"
          class="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-bold outline-none"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="nationalNumber"
          [disabled]="disabled"
          (input)="onNumberInput($event)"
          (blur)="markTouched()"
        />
      </span>
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class PhoneInputComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Teléfono';
  @Input() placeholder = '600 000 000';
  @Input() hint = '';
  @Input() error = '';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() valueChange = new EventEmitter<string>();

  countryCode = '+34';
  nationalNumber = '';

  readonly prefixes = [
    { code: '+34', label: 'ES +34' },
    { code: '+33', label: 'FR +33' },
    { code: '+351', label: 'PT +351' },
    { code: '+39', label: 'IT +39' },
  ];

  override writeValue(value: string | null): void {
    const raw = value ?? '';
    const match = this.prefixes.find((p) => raw.startsWith(p.code));
    if (match) {
      this.countryCode = match.code;
      this.nationalNumber = raw.slice(match.code.length).trim();
    } else {
      this.nationalNumber = raw;
    }
  }

  fullValue(): string {
    const digits = this.nationalNumber.replace(/\s+/g, ' ').trim();
    return digits ? `${this.countryCode} ${digits}` : '';
  }

  onPrefixChange(event: Event): void {
    this.countryCode = (event.target as HTMLSelectElement).value;
    this.commit();
  }

  onNumberInput(event: Event): void {
    this.nationalNumber = (event.target as HTMLInputElement).value;
    this.commit();
  }

  private commit(): void {
    const next = this.fullValue();
    this.emitChange(next);
    this.valueChange.emit(next);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }
}
