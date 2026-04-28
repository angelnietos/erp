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
      font-size: 0.65rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.15em; 
      color: var(--text-muted); 
      margin-left: 8px; 
      font-family: var(--font-main);
      opacity: 0.9;
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: stretch;
      border-radius: 12px;
      --select-padding-v: calc(var(--page-gap, 1.5rem) * 0.5 + 0.2rem);
      --select-padding-h: calc(var(--page-gap, 1.5rem) * 0.7 + 0.3rem);
    }

    /* Base — Theme Aware Style */
    select {
      width: 100%;
      padding: var(--select-padding-v) 3rem var(--select-padding-v) var(--select-padding-h);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.4;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      font-family: var(--font-main);
      appearance: none;
      cursor: pointer;
      color-scheme: dark light;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
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
  @Output() valueChange = new EventEmitter<string>();

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
    this.valueChange.emit(val);
  }

  onBlur(): void { this.onTouched(); }
}
