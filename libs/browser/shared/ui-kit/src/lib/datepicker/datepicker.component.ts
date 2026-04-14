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

    /* Base Input Styles */
    input {
      width: 100%; 
      padding: 12px 16px; 
      border-radius: 6px;
      font-size: 0.9rem; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      outline: none; 
      font-family: var(--font-main);
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      color: var(--text-primary);
    }

    input:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    /* Webkit Calendar Icon Styling */
    input::-webkit-calendar-picker-indicator {
      filter: invert(0.8) sepia(1) saturate(5) hue-rotate(-50deg); /* Brand-ish color */
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.3s ease;
    }
    
    input:focus::-webkit-calendar-picker-indicator {
      opacity: 1;
      filter: invert(1);
    }

    /* Variants */
    .datepicker-default {
      background: var(--bg-tertiary);
      border-color: var(--border-vibrant);
    }

    .datepicker-filled {
      background: color-mix(in srgb, var(--bg-tertiary) 85%, var(--brand, #e60012) 15%);
      border-color: color-mix(in srgb, var(--brand) 40%, transparent);
    }

    .datepicker-outlined {
      background: transparent;
      border: 2px solid color-mix(in srgb, var(--brand) 45%, var(--border-vibrant));
    }

    .datepicker-ghost {
      background: transparent;
      border: 1px dashed rgba(255, 255, 255, 0.2);
    }

    .datepicker-ghost:focus {
      background: rgba(255, 255, 255, 0.04);
      border-style: solid;
    }

    .datepicker-dark {
      background: #050508;
      border-color: rgba(255, 255, 255, 0.08);
    }

    .datepicker-light {
      background: rgba(248, 250, 252, 0.95);
      border-color: rgba(15, 23, 42, 0.15);
      color: #0f172a;
    }

    .datepicker-light::-webkit-calendar-picker-indicator {
      filter: none;
      opacity: 0.85;
    }

    .datepicker-error {
      border-color: var(--danger) !important;
      background: color-mix(in srgb, var(--danger) 8%, var(--bg-tertiary)) !important;
    }

    .datepicker-success {
      border-color: var(--success);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--success) 35%, transparent);
    }

    .datepicker-warning {
      border-color: var(--warning);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--warning) 30%, transparent);
    }

    .datepicker-info {
      border-color: var(--info);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--info) 30%, transparent);
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
