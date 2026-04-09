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

    /* Variants */
    .select-glass {
      background: var(--theme-input-bg, rgba(255, 255, 255, 0.03));
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border-color: var(--theme-input-border, rgba(255, 255, 255, 0.06));
    }

    select.invalid { border-color: var(--danger, #ef4444); }
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
