import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type DatepickerVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'ui-josanz-datepicker',
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
    .datepicker { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .label { color: var(--theme-text-muted, #64748B); font-size: 13px; font-weight: 500; }
    .input-wrapper { position: relative; }

    /* Base Input Styles */
    input {
      width: 100%; padding: 12px 14px; border-radius: 12px;
      font-size: 14px; transition: all 0.2s ease; outline: none; font-family: inherit;
    }

    /* Default Variant */
    .datepicker-default {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .datepicker-default:focus {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }

    /* Filled Variant */
    .datepicker-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .datepicker-filled:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    /* Outlined Variant */
    .datepicker-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .datepicker-outlined:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    /* Ghost Variant */
    .datepicker-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .datepicker-ghost:focus {
      background: var(--theme-surface, #FFFFFF);
      border-color: var(--theme-border, #E2E8F0);
    }

    /* Dark Variant */
    .datepicker-dark {
      background: #1E293B;
      border: 1px solid #334155;
      color: white;
    }
    .datepicker-dark::-webkit-calendar-picker-indicator { filter: invert(1); }
    .datepicker-dark:focus {
      border-color: var(--theme-primary, #4F46E5);
      background: rgba(255, 255, 255, 0.08);
    }

    /* Light Variant */
    .datepicker-light {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }
    .datepicker-light:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    /* Error Variant */
    .datepicker-error {
      border-color: #EF4444;
      background: #FEF2F2;
      color: #DC2626;
    }
    .datepicker-error:focus {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    /* Success Variant */
    .datepicker-success {
      border-color: #10B981;
      background: #ECFDF5;
      color: #059669;
    }
    .datepicker-success:focus {
      border-color: #10B981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    /* Warning Variant */
    .datepicker-warning {
      border-color: #F59E0B;
      background: #FFFBEB;
      color: #D97706;
    }
    .datepicker-warning:focus {
      border-color: #F59E0B;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
    }

    /* Info Variant */
    .datepicker-info {
      border-color: #0EA5E9;
      background: #F0F9FF;
      color: #0284C7;
    }
    .datepicker-info:focus {
      border-color: #0EA5E9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }

    input:disabled { opacity: 0.6; cursor: not-allowed; }
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
