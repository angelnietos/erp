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
    .datepicker { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; position: relative; }
    .label {
      font-size: 0.7rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      color: var(--text-muted); 
      margin-left: 0.25rem;
      font-family: var(--font-main);
    }
    .input-wrapper { position: relative; }

    input {
      width: 100%; 
      padding: 0.75rem 1rem;
      background: var(--surface-vibrant, var(--bg-secondary));
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md, 10px);
      color: var(--text-primary);
      font-size: 0.9rem; 
      font-weight: 500;
      transition: all 0.25s ease;
      outline: none; 
      font-family: var(--font-main);
      box-shadow: var(--shadow-sm);
    }

    input:focus {
      background: var(--surface-rich);
      border-color: var(--brand);
      box-shadow: 
        0 0 0 3px var(--brand-glow),
        var(--shadow-md);
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

    /* Babooni Tenant Enhancements */
    :host-context(html[data-erp-tenant='babooni']) input {
      border-radius: 12px;
      font-weight: 600;
      border-color: color-mix(in srgb, var(--border-soft) 60%, transparent);
      box-shadow: 
        var(--shadow-sm),
        inset 0 1px 0 var(--surface-glow, transparent);
      backdrop-filter: blur(10px);
    }

    :host-context(html[data-erp-tenant='babooni']) input:focus {
      box-shadow: 
        0 0 0 3px var(--brand-glow),
        var(--shadow-md),
        inset 0 1px 0 var(--surface-glow, transparent);
    }
 
    :host-context(html[data-erp-tenant='babooni']) .label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--brand);
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
