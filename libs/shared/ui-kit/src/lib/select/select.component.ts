import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SelectVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'theme';

@Component({
  selector: 'ui-josanz-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div class="select-wrapper">
        <select 
          [id]="id" 
          (change)="onSelect($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class]="'select-' + variant"
          [class.invalid]="error"
        >
          @if (placeholder) {
            <option value="" disabled [selected]="!value">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [selected]="value === option.value">
              {{ option.label }}
            </option>
          }
        </select>
        <div class="chevron"></div>
      </div>
    </div>
  `,
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    label { color: var(--theme-text-muted, #64748B); font-size: 13px; font-weight: 500; margin-left: 4px; }
    .select-wrapper { position: relative; display: flex; align-items: center; }

    /* Base Select Styles */
    select {
      width: 100%; padding: 12px 36px 12px 14px; border-radius: 12px;
      font-size: 14px; transition: all 0.2s ease; outline: none; font-family: inherit;
      appearance: none; cursor: pointer;
    }

    /* Theme Variant - Uses CSS variables from ThemeService */
    .select-theme {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .select-theme:focus {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }
    .select-theme option {
      background: var(--theme-surface, #FFFFFF);
      color: var(--theme-text, #1E293B);
    }

    /* Variants */
    .select-default {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .select-default:focus {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }

    .select-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .select-filled:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .select-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .select-outlined:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .select-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .select-ghost:focus {
      background: var(--theme-surface, #FFFFFF);
      border-color: var(--theme-border, #E2E8F0);
    }

    .select-dark {
      background: #1E293B;
      border: 1px solid #334155;
      color: white;
    }
    .select-dark:focus {
      border-color: var(--theme-primary, #4F46E5);
      background: rgba(255, 255, 255, 0.08);
    }

    .select-light {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }
    .select-light:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .select-error {
      border-color: #EF4444;
      background: #FEF2F2;
      color: #DC2626;
    }
    .select-error:focus {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .select-success {
      border-color: #10B981;
      background: #ECFDF5;
      color: #059669;
    }
    .select-success:focus {
      border-color: #10B981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    .select-warning {
      border-color: #F59E0B;
      background: #FFFBEB;
      color: #D97706;
    }
    .select-warning:focus {
      border-color: #F59E0B;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
    }

    .select-info {
      border-color: #0EA5E9;
      background: #F0F9FF;
      color: #0284C7;
    }
    .select-info:focus {
      border-color: #0EA5E9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }

    select.invalid { border-color: rgba(239, 68, 68, 0.5); }
    select:disabled { opacity: 0.6; cursor: not-allowed; }

    .chevron {
      position: absolute; right: 14px; width: 8px; height: 8px;
      border-right: 2px solid var(--theme-text-muted, #64748B); border-bottom: 2px solid var(--theme-text-muted, #64748B);
      transform: rotate(45deg); pointer-events: none; margin-top: -4px;
    }
    option { background: var(--theme-surface, #FFFFFF); color: var(--theme-text, #1E293B); }
  `],
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: { label: string, value: any }[] = [];
  @Input() error = false;
  @Input() variant: SelectVariant = 'default';

  value: any = '';
  disabled = false;
  onChange = (_value: unknown) => {
    // Standard Angular ControlValueAccessor placeholder
  };
  onTouched = () => {
    // Standard Angular ControlValueAccessor placeholder
  };

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
