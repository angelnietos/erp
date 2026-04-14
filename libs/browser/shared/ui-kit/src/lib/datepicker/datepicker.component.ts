import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type DatepickerVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDatepickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="datepicker">
      <label [attr.for]="inputId" [style.display]="label ? 'block' : 'none'" class="label">{{ label }}</label>
      <div class="input-wrapper">
        <input 
          [id]="inputId"
          type="date" 
          [value]="value"
          (input)="onInput($event)"
          [disabled]="disabled"
          [min]="minDate"
          [max]="maxDate"
          [class]="'datepicker-' + variant"
        />
      </div>
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .datepicker { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .label { 
      font-size: 0.75rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      color: var(--text-secondary); 
      margin-left: 2px; 
    }
    .input-wrapper { position: relative; }

    input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.9rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      font-family: var(--font-main);
      background:
        var(--fld-surface-soft),
        color-mix(in srgb, var(--bg-tertiary) 92%, var(--fld-brand) 8%);
      border: 1px solid var(--fld-border-muted);
      color: var(--text-primary);
      box-shadow: var(--fld-shine-subtle), inset 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    input:focus {
      border-color: var(--fld-border-brand);
      background: color-mix(in srgb, var(--bg-secondary) 88%, #fff 6%);
      box-shadow: var(--fld-ring-brand), var(--fld-shadow-brand);
    }

    input::-webkit-calendar-picker-indicator {
      filter: invert(0.85) sepia(1) saturate(6) hue-rotate(320deg);
      cursor: pointer;
      opacity: 0.65;
      transition: all 0.3s ease;
    }

    input:focus::-webkit-calendar-picker-indicator {
      opacity: 1;
      filter: invert(0.9) sepia(1) saturate(8) hue-rotate(320deg);
    }

    .datepicker-default {
      background: color-mix(in srgb, var(--bg-tertiary) 94%, var(--fld-brand) 6%);
      border-color: color-mix(in srgb, var(--fld-brand) 18%, var(--border-vibrant));
    }

    .datepicker-filled {
      background: var(--fld-surface-deep);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), inset 0 3px 10px rgba(0, 0, 0, 0.35);
    }

    .datepicker-outlined {
      background: transparent;
      border: 2px solid var(--fld-border-brand);
      box-shadow: none;
    }

    .datepicker-ghost {
      background: transparent;
      border: 1px dashed color-mix(in srgb, var(--fld-brand) 28%, rgba(255, 255, 255, 0.2));
    }

    .datepicker-ghost:focus {
      background: color-mix(in srgb, var(--fld-brand) 6%, transparent);
      border-style: solid;
    }

    .datepicker-dark {
      background: linear-gradient(180deg, #0a0b10 0%, #050508 100%);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .datepicker-light {
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      border-color: color-mix(in srgb, var(--fld-brand) 16%, #cbd5e1);
      color: #0f172a;
      box-shadow: var(--fld-shine-top), 0 4px 16px rgba(15, 23, 42, 0.06);
    }

    .datepicker-light::-webkit-calendar-picker-indicator {
      filter: none;
      opacity: 0.85;
    }

    .datepicker-error {
      border-color: var(--fld-danger) !important;
      background: color-mix(in srgb, var(--fld-danger) 9%, var(--bg-tertiary)) !important;
      box-shadow: var(--fld-glow-danger) !important;
    }

    .datepicker-success {
      border-color: color-mix(in srgb, var(--fld-success) 65%, transparent);
      background: color-mix(in srgb, var(--fld-success) 7%, var(--bg-tertiary));
      box-shadow: var(--fld-glow-success);
    }

    .datepicker-warning {
      border-color: color-mix(in srgb, var(--fld-warning) 62%, transparent);
      background: color-mix(in srgb, var(--fld-warning) 8%, var(--bg-tertiary));
      box-shadow: var(--fld-glow-warning);
    }

    .datepicker-info {
      border-color: color-mix(in srgb, var(--fld-info) 62%, transparent);
      background: color-mix(in srgb, var(--fld-info) 8%, var(--bg-tertiary));
      box-shadow: var(--fld-glow-info);
    }

    input:disabled { 
      opacity: 0.4; 
      cursor: not-allowed; 
      filter: grayscale(1);
    }
  `],
})
export class UiDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() minDate = '';
  @Input() maxDate = '';
  @Input() disabled = false;
  @Input() variant: DatepickerVariant = 'default';

  inputId = 'ui-datepicker-input';
  value = '';
  touched = false;
  onChange: (value: string) => void = (value: string) => {
    this.value = value;
  };
  onTouched: () => void = () => {
    this.touched = true;
  };

  writeValue(value: string): void { this.value = value; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
}
