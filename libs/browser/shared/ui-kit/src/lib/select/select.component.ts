import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SelectVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'theme' | 'primary' | 'secondary' | 'transparent' | 'minimal' | 'rounded' | 'glass' | 'soft';

@Component({
  selector: 'ui-select',
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
          [class.select-sm]="size === 'sm'"
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
    .form-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    label { 
      font-size: 0.75rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      color: var(--text-secondary); 
      margin-left: 2px; 
    }
    .select-wrapper { position: relative; display: flex; align-items: center; }

    /* Base Select Styles */
    select {
      width: 100%; 
      padding: 8px 32px 8px 12px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.8rem;
      transition: var(--transition-base, 280ms ease); 
      outline: none; 
      font-family: var(--font-main);
      appearance: none; 
      cursor: pointer;
      box-shadow: var(--shadow-inset-shine, inset 0 1px 0 rgba(255, 255, 255, 0.04));
    }

    .select-sm { padding: 4px 28px 4px 10px !important; font-size: 0.72rem !important; }
    .select-sm + .chevron { right: 10px; width: 6px; height: 6px; margin-top: -4px; }

    select:focus {
      border-color: color-mix(in srgb, var(--brand) 70%, var(--border-soft));
      background: color-mix(in srgb, var(--bg-secondary) 90%, var(--brand) 3%);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--brand-glow) 38%, transparent),
        0 10px 26px -10px var(--brand-glow);
    }

    select:focus-visible {
      outline: 2px solid var(--ring-focus, color-mix(in srgb, var(--brand) 50%, transparent));
      outline-offset: 2px;
    }

    /* Variants */
    .select-theme, .select-default {
      background: var(--bg-tertiary);
      border-color: var(--border-vibrant);
    }

    .select-filled {
      background: rgba(255, 255, 255, 0.05);
      border-color: transparent;
    }

    .select-outlined {
      background: transparent;
      border: 2px solid var(--border-vibrant);
    }

    .select-ghost {
      background: transparent;
      border: 1px solid transparent;
    }
    .select-ghost:focus {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--brand);
    }

    .select-dark {
      background: #000;
      border-color: #222;
    }

    .select-error {
      border-color: var(--danger) !important;
      background: rgba(239, 68, 68, 0.05);
    }
    
    .select-error:focus {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .select-success {
      border-color: var(--success);
    }

    /* Additional variants */
    .select-primary {
      background: var(--brand-surface, color-mix(in srgb, var(--brand) 14%, transparent));
      border-color: var(--brand);
    }

    .select-secondary {
      background: rgba(99, 102, 241, 0.1);
      border-color: #6366f1;
    }

    .select-transparent {
      background: transparent;
      border: none;
    }

    .select-minimal {
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--border-soft);
      border-radius: 0;
    }

    .select-rounded {
      border-radius: 50px;
      padding-left: 1.5rem;
    }

    .select-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .select-soft {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }

    select.invalid { border-color: var(--danger); }
    select:disabled { 
      opacity: 0.4; 
      cursor: not-allowed; 
      filter: grayscale(1);
    }

    .chevron {
      position: absolute; 
      right: 12px; /* Adjusted from 16px */
      width: 8px; /* Slightly smaller chevron */
      height: 8px;
      border-right: 2px solid var(--text-muted); 
      border-bottom: 2px solid var(--text-muted);
      transform: rotate(45deg); 
      pointer-events: none; 
      margin-top: -6px;
      transition: all 0.3s ease;
    }
    
    select:focus + .chevron {
      border-color: var(--brand);
      transform: rotate(225deg) translateY(-2px);
    }

    option { 
      background: var(--bg-secondary); 
      color: var(--text-primary); 
    }
  `],
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: { label: string, value: unknown }[] = [];
  @Input() error = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() variant: SelectVariant = 'default';

  value: unknown = '';
  disabled = false;
  onChange = (_: unknown) => {
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
