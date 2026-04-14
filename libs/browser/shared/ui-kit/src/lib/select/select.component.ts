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
          [class]="'select-' + variant + (size === 'sm' ? ' select-sm' : '')"
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
      font-size: 0.65rem; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 0.15em; 
      color: var(--text-muted, #888); 
      margin-left: 8px; 
    }
    .select-wrapper { position: relative; display: flex; align-items: center; }

    /* Base Select Styles */
    select {
      width: 100%; 
      padding: 0.9rem 2.5rem 0.9rem 1.25rem;
      background: var(--theme-input-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--theme-input-border, rgba(255, 255, 255, 0.1));
      border-radius: var(--theme-input-radius, 14px);
      color: var(--text-primary, #fff);
      font-size: 0.85rem; font-weight: 600;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
      outline: none; 
      font-family: inherit;
      appearance: none; 
      cursor: pointer;
      box-shadow: var(--theme-input-shadow, inset 0 2px 4px rgba(0,0,0,0.2));
    }

    .select-sm { padding: 0.5rem 2.25rem 0.5rem 0.85rem !important; font-size: 0.75rem !important; }

    select:focus {
      background: color-mix(in srgb, var(--theme-input-bg, rgba(255,255,255,0.05)) 80%, var(--text-primary, #fff));
      border-color: var(--brand, #3b82f6);
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--brand, #3b82f6) 15%, transparent),
        var(--theme-input-shadow, 0 8px 30px -10px color-mix(in srgb, var(--brand, #3b82f6) 40%, transparent));
    }

    /* Variants — cada clase debe verse distinta en tema oscuro */
    .select-default {
      /* hereda base */
    }

    .select-filled {
      background: color-mix(in srgb, var(--surface, rgba(24, 26, 36, 1)) 92%, var(--brand, #e60012) 8%);
      border-color: color-mix(in srgb, var(--border-vibrant, #fff) 22%, transparent);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.35);
    }

    .select-outlined {
      background: transparent;
      border-width: 2px;
      border-color: color-mix(in srgb, var(--text-secondary, #ccc) 45%, transparent);
      box-shadow: none;
    }

    .select-ghost {
      background: transparent;
      border-color: transparent;
      border-bottom: 1px solid var(--border-soft, rgba(255, 255, 255, 0.12));
      border-radius: 0;
      box-shadow: none;
    }

    .select-dark {
      background: #08090d;
      border-color: rgba(255, 255, 255, 0.06);
    }

    .select-light {
      background: rgba(248, 250, 252, 0.96);
      border-color: rgba(15, 23, 42, 0.12);
      color: #0f172a;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
    }

    .select-light option {
      background: #f1f5f9;
      color: #0f172a;
    }

    .select-error {
      border-color: color-mix(in srgb, var(--danger, #f87171) 65%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--danger, #f87171) 35%, transparent);
    }

    .select-success {
      border-color: color-mix(in srgb, var(--success, #34d399) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--success, #34d399) 25%, transparent);
    }

    .select-warning {
      border-color: color-mix(in srgb, var(--warning, #fbbf24) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--warning, #fbbf24) 22%, transparent);
    }

    .select-info {
      border-color: color-mix(in srgb, var(--info, #38bdf8) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--info, #38bdf8) 22%, transparent);
    }

    .select-primary {
      background: color-mix(in srgb, var(--brand, #e60012) 18%, rgba(0, 0, 0, 0.2));
      border-color: color-mix(in srgb, var(--brand, #e60012) 55%, transparent);
    }

    .select-secondary {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .select-theme {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--brand, #e60012) 12%, transparent),
        rgba(255, 255, 255, 0.04)
      );
      border-color: color-mix(in srgb, var(--brand, #e60012) 35%, transparent);
    }

    .select-transparent {
      background: transparent;
      border-style: dashed;
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: none;
    }

    .select-minimal {
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.8rem;
    }

    .select-rounded {
      border-radius: 999px;
    }

    .select-soft {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
    }

    .select-glass {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    select.invalid {
      border-color: var(--danger, #ef4444) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--danger, #ef4444) 35%, transparent) !important;
    }
    select:disabled { opacity: 0.4; cursor: not-allowed; }

    .chevron {
      position: absolute; 
      right: 1.15rem;
      width: 0.65rem;
      height: 0.65rem;
      border-right: 2px solid var(--text-muted, #888); 
      border-bottom: 2px solid var(--text-muted, #888);
      transform: rotate(45deg); 
      pointer-events: none; 
      margin-top: -5px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    select:focus + .chevron {
      border-color: var(--brand, #3b82f6);
      transform: rotate(225deg) translateY(-2px);
      filter: drop-shadow(0 0 8px color-mix(in srgb, var(--brand, #3b82f6) 60%, transparent));
    }

    option { background: var(--bg-secondary, #0c0d12); color: var(--text-primary, #fff); }
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
