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
    .datepicker { display: flex; flex-direction: column; gap: 10px; width: 100%; position: relative; }
    .label {
      font-size: 0.7rem; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.2em; color: var(--text-muted);
      margin-left: 12px; font-family: var(--font-display);
    }
    .input-wrapper { position: relative; }

    input {
      width: 100%; padding: 1.15rem 1.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.9rem; font-weight: 600;
      transition: all 0.4s var(--transition-spring);
      outline: none; font-family: inherit;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    input:focus {
      background: color-mix(in srgb, var(--bg-secondary) 70%, var(--brand) 5%);
      border-color: var(--brand);
      box-shadow: 
        0 0 25px color-mix(in srgb, var(--brand) 25%, transparent),
        inset 0 2px 10px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }

    input::-webkit-calendar-picker-indicator {
      filter: invert(1) brightness(0.8) sepia(1) saturate(10) hue-rotate(var(--brand-hue, 320deg));
      cursor: pointer;
      opacity: 0.65;
      transition: all 0.3s ease;
      transform: scale(1.1);
    }

    input:focus::-webkit-calendar-picker-indicator {
      opacity: 1;
      transform: scale(1.2);
    }

    .datepicker-error {
      border-color: var(--danger) !important;
      background: color-mix(in srgb, var(--danger) 5%, var(--bg-secondary)) !important;
      box-shadow: 0 0 20px color-mix(in srgb, var(--danger) 20%, transparent) !important;
    }

    .datepicker-success {
      border-color: var(--success);
      background: color-mix(in srgb, var(--success) 5%, var(--bg-secondary));
    }

    input:disabled { 
      opacity: 0.4; 
      cursor: not-allowed; 
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
