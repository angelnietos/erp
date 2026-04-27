import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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
    .form-group { display: flex; flex-direction: column; gap: 10px; width: 100%; position: relative; }
    label { 
      font-size: 0.75rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      color: var(--text-muted); 
      margin-left: 4px; 
      font-family: var(--font-main);
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: stretch;
      border-radius: inherit;
    }

    /* Base — Theme Aware Style */
    select {
      width: 100%;
      padding: 0.75rem 3rem 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.4;
      transition: all 0.3s ease;
      outline: none;
      font-family: var(--font-main);
      appearance: none;
      cursor: pointer;
      color-scheme: dark light;
    }

    select:not(:disabled):hover {
      border-color: var(--brand);
      background: var(--bg-tertiary);
    }

    .select-sm {
      padding: 0.5rem 2.5rem 0.5rem 1rem !important;
      font-size: 0.8rem !important;
    }

    select:focus {
      background: var(--bg-primary);
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-glow);
    }

    .select-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
    }

    select.invalid {
      border-color: var(--danger) !important;
    }
    
    select:disabled { opacity: 0.5; cursor: not-allowed; }

    .chevron {
      position: absolute;
      right: 1.25rem;
      top: 50%;
      width: 0.5rem;
      height: 0.5rem;
      border-right: 2px solid var(--text-muted);
      border-bottom: 2px solid var(--text-muted);
      transform: translateY(-60%) rotate(45deg);
      pointer-events: none;
      transition: transform 0.3s ease;
    }

    select:focus + .chevron {
      transform: translateY(-20%) rotate(225deg);
    }

    /* Standard options follow the theme colors to ensure contrast and integration */
    option {
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 10px;
    }

    :host-context(html[data-theme-is-light='true']) option {
      background-color: #ffffff;
      color: #000000;
    }
}

    /**
     * Babooni: el select base asume campo “oscuro” (texto claro + color-scheme dark).
     * En tenant Babooni el kit fija texto oscuro sobre superficies claras → contraste ilegible.
     * Aquí alineamos fondo, texto, options y bordes con tokens de ThemeService (también con variantes premium).
     */
    :host-context(html[data-erp-tenant='babooni']) {
      --fld-border-muted: color-mix(in srgb, var(--text-primary, #080808) 14%, transparent);
      --fld-border-brand: color-mix(in srgb, var(--fld-brand) 52%, rgba(8, 8, 8, 0.14));
      --fld-surface-soft: linear-gradient(
        180deg,
        var(--theme-surface, #fffefe) 0%,
        color-mix(in srgb, var(--theme-surface, #fffefe) 88%, var(--bg-secondary, #f7f7f7)) 100%
      );
      --fld-glass: linear-gradient(
        155deg,
        color-mix(in srgb, var(--theme-surface, #fffefe) 92%, var(--fld-brand) 8%) 0%,
        color-mix(in srgb, var(--bg-secondary, #f7f7f7) 94%, var(--fld-brand) 6%) 100%
      );
    }

    :host-context(html[data-erp-tenant='babooni']) select {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid color-mix(in srgb, var(--border-soft, rgba(8, 8, 8, 0.1)) 70%, transparent);
      border-radius: 9999px;
      color: var(--text-primary, #080808);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
      backdrop-filter: blur(12px);
      color-scheme: light;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    :host-context(html[data-erp-tenant='babooni']) select:not(:disabled):hover {
      border-color: color-mix(in srgb, var(--fld-brand) 40%, transparent);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      background: rgba(255, 255, 255, 0.95);
    }

    :host-context(html[data-erp-tenant='babooni']) select:focus-visible {
      background: #ffffff;
      border-color: var(--fld-brand);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--fld-brand) 15%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-filled,
    :host-context(html[data-erp-tenant='babooni']) .select-soft,
    :host-context(html[data-erp-tenant='babooni']) .select-glass,
    :host-context(html[data-erp-tenant='babooni']) .select-secondary,
    :host-context(html[data-erp-tenant='babooni']) .select-theme,
    :host-context(html[data-erp-tenant='babooni']) .select-minimal {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 92%, var(--fld-brand) 8%);
      border-color: var(--border-soft, rgba(8, 8, 8, 0.1));
      color: var(--text-primary);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 1px 3px rgba(8, 8, 8, 0.05);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .select-soft:not(:disabled):hover {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 86%, var(--fld-brand) 14%);
      border-color: color-mix(in srgb, var(--fld-brand) 38%, rgba(8, 8, 8, 0.1));
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.95) inset,
        0 4px 16px -4px color-mix(in srgb, var(--fld-brand) 22%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-outlined {
      background: transparent;
      border-color: color-mix(in srgb, var(--fld-brand) 35%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-ghost {
      border-bottom-color: color-mix(in srgb, var(--fld-brand) 40%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-primary {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--fld-brand) 22%, var(--theme-surface)) 0%,
        color-mix(in srgb, var(--fld-brand) 10%, var(--bg-secondary)) 100%
      );
      border-color: color-mix(in srgb, var(--fld-brand) 45%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-error,
    :host-context(html[data-erp-tenant='babooni']) .select-success,
    :host-context(html[data-erp-tenant='babooni']) .select-warning,
    :host-context(html[data-erp-tenant='babooni']) .select-info {
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) option {
      background-color: var(--theme-surface, #fffefe);
      color: var(--text-primary, #080808);
      font-weight: 500;
      padding: 0.5rem 0.75rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .chevron {
      border-right-color: var(--text-muted, #646464);
      border-bottom-color: var(--text-muted, #646464);
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

  @Output() change = new EventEmitter<string>();

  value: unknown = '';
  disabled = false;
  onChange: (value: unknown) => void = () => {
    /* CVA stub; registerOnChange replaces this */
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
    this.change.emit(val);
  }
  onBlur(): void { this.onTouched(); }
}
