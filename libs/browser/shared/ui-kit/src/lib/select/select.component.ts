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
  styleUrls: ['../styles/form-field-visual.scss'],
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

    /* Base — relieve suave + coherencia con marca */
    select {
      width: 100%;
      padding: 0.9rem 2.5rem 0.9rem 1.25rem;
      background:
        var(--fld-surface-soft),
        color-mix(in srgb, var(--theme-input-bg, #12141c) 94%, var(--fld-brand) 6%);
      border: 1px solid var(--fld-border-muted);
      border-radius: var(--theme-input-radius, 14px);
      color: var(--text-primary, #fff);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
      font-family: inherit;
      appearance: none;
      cursor: pointer;
      box-shadow: var(--fld-shine-subtle), inset 0 2px 6px rgba(0, 0, 0, 0.28);
      color-scheme: dark; /* Fuerza al navegador a usar UI oscura para el dropdown nativo */
    }

    .select-sm { padding: 0.5rem 2.25rem 0.5rem 0.85rem !important; font-size: 0.75rem !important; }

    select:focus {
      background: color-mix(in srgb, var(--theme-input-bg, #12141c) 78%, #fff 8%);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-ring-brand), var(--fld-shadow-brand), var(--fld-shine-top);
    }

    .select-default {
      /* hereda base */
    }

    .select-filled {
      background: var(--fld-surface-deep);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), inset 0 4px 14px rgba(0, 0, 0, 0.45);
    }

    .select-outlined {
      background: transparent;
      border-width: 2px;
      border-color: color-mix(in srgb, var(--fld-brand) 35%, rgba(148, 163, 184, 0.45));
      box-shadow: none;
    }

    .select-ghost {
      background: transparent;
      border-color: transparent;
      border-bottom: 2px solid color-mix(in srgb, var(--fld-brand) 28%, rgba(255, 255, 255, 0.12));
      border-radius: 0;
      box-shadow: none;
    }

    .select-dark {
      background: linear-gradient(180deg, #0a0b10 0%, #050508 100%);
      border-color: rgba(255, 255, 255, 0.07);
      box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.6);
    }

    .select-light {
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      border-color: color-mix(in srgb, var(--fld-brand) 18%, #cbd5e1);
      color: #0f172a;
      box-shadow: var(--fld-shine-top), 0 4px 18px rgba(15, 23, 42, 0.08);
      color-scheme: light;
    }

    .select-light option {
      background: #f8fafc;
      color: #0f172a;
    }

    .select-error {
      border-color: color-mix(in srgb, var(--fld-danger) 72%, transparent) !important;
      background: color-mix(in srgb, var(--fld-danger) 9%, #14161f) !important;
      box-shadow: var(--fld-glow-danger);
    }

    .select-success {
      border-color: color-mix(in srgb, var(--fld-success) 62%, transparent);
      background: color-mix(in srgb, var(--fld-success) 7%, #12141c);
      box-shadow: var(--fld-glow-success);
    }

    .select-warning {
      border-color: color-mix(in srgb, var(--fld-warning) 58%, transparent);
      background: color-mix(in srgb, var(--fld-warning) 8%, #12141c);
      box-shadow: var(--fld-glow-warning);
    }

    .select-info {
      border-color: color-mix(in srgb, var(--fld-info) 58%, transparent);
      background: color-mix(in srgb, var(--fld-info) 8%, #12141c);
      box-shadow: var(--fld-glow-info);
    }

    .select-primary {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--fld-brand) 32%, #1a0a0c) 0%,
        color-mix(in srgb, var(--fld-brand) 12%, #0f1016) 100%
      );
      border-color: color-mix(in srgb, var(--fld-brand) 58%, rgba(255, 255, 255, 0.1));
      box-shadow: var(--fld-shine-top), var(--fld-shadow-float);
    }

    .select-secondary {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%);
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: var(--fld-shine-subtle), 0 8px 28px rgba(0, 0, 0, 0.2);
    }

    .select-theme {
      background: linear-gradient(
        125deg,
        color-mix(in srgb, var(--fld-brand) 22%, transparent) 0%,
        rgba(255, 255, 255, 0.06) 45%,
        rgba(0, 0, 0, 0.2) 100%
      );
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), 0 12px 36px -14px color-mix(in srgb, var(--fld-brand) 45%, transparent);
    }

    .select-transparent {
      background: transparent;
      border-style: dashed;
      border-color: color-mix(in srgb, var(--fld-brand) 25%, rgba(255, 255, 255, 0.2));
      box-shadow: none;
    }

    .select-minimal {
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--fld-border-muted);
      font-size: 0.8rem;
    }

    .select-rounded {
      border-radius: 999px;
    }

    .select-soft {
      background: var(--fld-glass);
      border-color: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--fld-shine-top), var(--fld-shadow-float);
    }

    .select-glass {
      background: var(--fld-glass);
      backdrop-filter: blur(16px) saturate(1.15);
      -webkit-backdrop-filter: blur(16px) saturate(1.15);
      border-color: color-mix(in srgb, #fff 16%, transparent);
      box-shadow: var(--fld-shine-top), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    select.invalid {
      border-color: var(--fld-danger) !important;
      box-shadow: var(--fld-glow-danger) !important;
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
      border-color: var(--fld-brand);
      transform: rotate(225deg) translateY(-2px);
      filter: drop-shadow(0 0 10px color-mix(in srgb, var(--fld-brand) 55%, transparent));
    }

    option { 
      background-color: #12141c; /* Color sólido para evitar transparencias extrañas */
      color: #ffffff; 
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
