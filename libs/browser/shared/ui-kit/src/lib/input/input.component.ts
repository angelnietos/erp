import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type InputColor = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'info';
export type InputShape = 'auto' | 'solid' | 'glass' | 'outline' | 'flat' | 'neumorphic' | 'underline' | 'minimal' | 'rounded';
export type InputVariant = string;

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group" [class.disabled]="disabled">
      @if (label) { <label [for]="id" class="label">{{ label }}</label> }
      
      <div
        class="input-wrapper"
        [ngClass]="['input-color-' + color, 'input-shape-' + shape, 'input-' + size]"
        [class.input-auto-overrides]="shape === 'auto'"
        [class.has-icon]="icon" 
        [class.has-error]="error" 
      >
        @if (icon) { <lucide-icon [name]="icon" class="field-icon" aria-hidden="true"></lucide-icon> }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [attr.aria-invalid]="error ? 'true' : null"
          [attr.aria-describedby]="error || hint ? getDescribedBy() : null"
          [required]="required"
          [attr.autocomplete]="autocomplete"
          [attr.inputmode]="inputmode"
          [attr.pattern]="pattern"
          [attr.minlength]="minlength"
          [attr.maxlength]="maxlength"
          [min]="min"
          [max]="max"
          [step]="step"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [disabled]="disabled"
        >
        <div class="focus-ring"></div>
      </div>
      
      @if (error && errorMessage) {
        <span [id]="errorId" class="hint error" role="alert" aria-live="polite">{{ errorMessage }}</span>
      }
      @if (hint && !error) {
        <span [id]="hintId" class="hint">{{ hint }}</span>
      }
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: var(--space-2); width: 100%; position: relative; }

    .label {
      font-size: var(--text-xs); font-weight: var(--font-bold); text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--text-muted);
      margin-left: var(--space-1); font-family: inherit;
    }

    .input-wrapper { 
      position: relative; display: flex; align-items: center; 
      --input-bg: var(--theme-input-bg, rgba(255, 255, 255, 0.05));
      --input-border: var(--theme-input-border, rgba(255, 255, 255, 0.1));
      --input-radius: var(--theme-input-radius, 14px);
      --input-color: var(--text-primary, #fff);
      --input-accent: var(--fld-brand);
    }

    /* THEMATIC COLOR TOKENS */
    .input-color-default { --input-accent: var(--fld-brand); }
    .input-color-primary { --input-accent: var(--fld-brand); }
    .input-color-danger { --input-accent: var(--fld-danger); }
    .input-color-success { --input-accent: var(--fld-success); }
    .input-color-warning { --input-accent: var(--fld-warning); }
    .input-color-info { --input-accent: var(--fld-info); }

    .input-wrapper.has-error { --input-border: var(--fld-danger); --input-accent: var(--fld-danger); }

    .input-shape-glass {
      --input-bg: color-mix(in srgb, rgba(255, 255, 255, 0.06) 40%, transparent);
      --input-border: color-mix(in srgb, var(--fld-brand) 22%, rgba(255, 255, 255, 0.1));
      backdrop-filter: blur(14px) saturate(1.1);
      -webkit-backdrop-filter: blur(14px) saturate(1.1);
    }

    /* Shapes — sin esto, auto/solid/outline/etc. se ven idénticos */
    .input-wrapper.input-shape-auto {
      --input-bg: color-mix(in srgb, var(--theme-input-bg, rgba(255,255,255,0.05)) 88%, var(--input-accent) 12%);
      --input-border: color-mix(in srgb, var(--input-accent) 22%, var(--theme-input-border, rgba(255,255,255,0.1)));
    }

    .input-wrapper.input-shape-solid {
      --input-bg: linear-gradient(180deg, color-mix(in srgb, var(--input-accent) 14%, #151722) 0%, #0e0f14 100%);
      --input-border: color-mix(in srgb, var(--input-accent) 38%, rgba(255, 255, 255, 0.08));
      --input-radius: 12px;
    }

    .input-wrapper.input-shape-outline {
      --input-bg: transparent;
      --input-border: color-mix(in srgb, var(--input-accent) 55%, rgba(255,255,255,0.15));
      --input-radius: 14px;
    }

    .input-wrapper.input-shape-outline input {
      border-width: 2px;
    }

    .input-wrapper.input-shape-flat {
      --input-bg: color-mix(in srgb, var(--fld-brand) 8%, rgba(255, 255, 255, 0.07));
      --input-border: var(--fld-border-muted);
      --input-radius: 10px;
    }

    .input-wrapper.input-shape-flat input {
      box-shadow: var(--fld-shine-subtle), inset 0 2px 6px rgba(0, 0, 0, 0.22);
    }

    .input-wrapper.input-shape-neumorphic {
      --input-bg: linear-gradient(145deg, #1a1c26 0%, #12141a 100%);
      --input-border: color-mix(in srgb, var(--input-accent) 15%, rgba(255, 255, 255, 0.06));
      --input-radius: 16px;
    }

    .input-wrapper.input-shape-neumorphic input {
      box-shadow:
        8px 8px 18px rgba(0, 0, 0, 0.5),
        -6px -6px 14px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .input-wrapper.input-shape-underline {
      --input-bg: transparent;
      --input-border: transparent;
      --input-radius: 0;
    }

    .input-wrapper.input-shape-underline input {
      border: none;
      border-bottom: 2px solid color-mix(in srgb, var(--input-accent) 50%, transparent);
      border-radius: 0 !important;
      box-shadow: none;
      padding-left: 0.25rem;
    }

    .input-wrapper.input-shape-minimal {
      --input-bg: rgba(255, 255, 255, 0.04);
      --input-border: rgba(255, 255, 255, 0.07);
      --input-radius: 8px;
    }

    .input-wrapper.input-shape-minimal input {
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      font-size: 0.8rem;
    }

    .input-wrapper.input-shape-rounded {
      --input-radius: 999px;
    }

    /* ELEMENT BASE RULES */
    input {
      width: 100%; padding: var(--space-2) var(--space-3);
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: var(--input-radius);
      color: var(--input-color);
      font-size: var(--text-base); font-weight: var(--font-medium);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none; font-family: inherit;
      box-shadow: var(--fld-shine-subtle), var(--theme-input-shadow, inset 0 2px 5px rgba(0, 0, 0, 0.25));
    }

    /* FOCUS STATES — anillo fuerte solo con teclado (:focus-visible) */
    input:focus-visible {
      background: color-mix(in srgb, var(--input-bg) 82%, #fff 10%);
      border-color: var(--input-accent);
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--input-accent) 15%, transparent),
        0 15px 35px -12px color-mix(in srgb, var(--input-accent) 45%, transparent),
        var(--fld-shine-top);
      transform: translateY(-1px);
    }

    input::placeholder {
      color: var(--text-muted); padding-left: 2px;
      opacity: 0.5;
      font-weight: 500;
    }
    
    .has-icon input { padding-left: calc(var(--space-6) + var(--space-2)); }
    .field-icon {
      position: absolute; left: var(--space-4); width: var(--text-base); height: var(--text-base);
      color: var(--text-muted); pointer-events: none; transition: all 0.3s;
      filter: drop-shadow(0 0 5px transparent);
    }
    input:focus-visible ~ .field-icon { 
       color: var(--input-accent);
       transform: scale(1.1);
       filter: drop-shadow(0 0 8px color-mix(in srgb, var(--input-accent) 60%, transparent));
    }

    input:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Babooni: campos claros (misma línea que ui-select / theme-input-bg) */
    :host-context(html[data-erp-tenant='babooni']) .input-wrapper input {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid color-mix(in srgb, var(--border-soft, rgba(8, 8, 8, 0.1)) 70%, transparent);
      border-radius: 9999px;
      color: var(--text-primary, #080808);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.01);
      backdrop-filter: blur(12px);
      color-scheme: light;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    :host-context(html[data-erp-tenant='babooni']) .input-wrapper input:focus-visible {
      background: #ffffff;
      border-color: var(--brand);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .hint {
      color: var(--text-muted);
      opacity: 0.8;
    }

    :host-context(html[data-erp-tenant='babooni']) .input-wrapper input::placeholder {
      opacity: 0.72;
    }

    /* Mobile touch improvements */
    @media (hover: none) and (pointer: coarse) {
      input {
        /* Ensure adequate touch target */
        min-height: var(--tap-target-min);
        padding-top: var(--space-3);
        padding-bottom: var(--space-3);
      }

      input:focus-visible {
        /* Enhanced focus ring for touch */
        outline: 3px solid var(--input-accent);
        outline-offset: 2px;
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .form-group {
        margin-bottom: var(--space-4);
      }

      input {
        font-size: var(--text-base); /* Slightly larger for mobile */
        padding: var(--space-4) var(--space-4);
      }

      .has-icon input {
        padding-left: calc(var(--space-8) + var(--space-2));
      }

      .field-icon {
        left: var(--space-3);
      }

      .label {
        font-size: var(--text-sm);
        margin-left: var(--space-3);
      }

      .hint {
        margin-left: var(--space-3);
        margin-top: var(--space-2);
        font-size: var(--text-sm);
      }
    }

    .hint { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); margin-left: var(--space-1); font-weight: var(--font-medium); letter-spacing: 0.02em; }
    .hint.error { color: var(--fld-danger); text-transform: uppercase; font-size: var(--text-xs); }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() hint?: string;
  @Input() error = false;
  @Input() errorMessage?: string;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() required = false;
  @Input() autocomplete: string | null = null;
  @Input() inputmode: string | null = null;
  @Input() pattern: string | null = null;
  @Input() minlength: number | null = null;
  @Input() maxlength: number | null = null;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step: number | null = null;

  @Input() color: InputColor = 'default';
  @Input() shape: InputShape = 'auto';

  // Backwards compatibility mapper for legacy code
  @Input() set variant(val: string) {
    if (['error', 'success', 'warning', 'info', 'primary', 'default'].includes(val)) {
      this.color = val as InputColor;
      this.shape = 'auto';
      if (val === 'error') this.error = true;
    } else if (['solid', 'glass', 'outline', 'outlined', 'flat', 'neumorphic', 'underline', 'minimal', 'rounded'].includes(val)) {
      this.shape = val === 'outlined' ? 'outline' : val as InputShape;
    } else if (val === 'filled') {
      this.shape = 'flat';
    } else {
      this.color = 'default';
      this.shape = 'auto';
    }
  }

  value = '';
  @Input() disabled = false;
  onChange: (value: string) => void = () => { /* empty */ };
  onTouched = () => { /* empty */ };

  /** Unique IDs for accessibility */
  hintId = `input-hint-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `input-error-${Math.random().toString(36).substr(2, 9)}`;

  writeValue(value: string | null | undefined): void {
    this.value = value == null || value === 'undefined' ? '' : String(value);
  }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  getDescribedBy(): string {
    const ids: string[] = [];
    if (this.error && this.hint) {
      ids.push(this.errorId, this.hintId);
    } else if (this.error) {
      ids.push(this.errorId);
    } else if (this.hint) {
      ids.push(this.hintId);
    }
    return ids.join(' ');
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onBlur(): void { this.onTouched(); }

  onFocus(): void { /* Focus event can be used for analytics or additional logic */ }
}
