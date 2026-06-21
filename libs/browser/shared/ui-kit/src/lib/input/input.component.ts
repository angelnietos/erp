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
        [class.has-trailing]="revealToggle && type === 'password'"
        [class.has-error]="error" 
      >
        @if (icon) { <lucide-icon [name]="icon" class="field-icon" aria-hidden="true"></lucide-icon> }
        <input 
          [id]="id" 
          [type]="passwordInputType" 
          [placeholder]="placeholder" 
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
        >
        @if (revealToggle && type === 'password') {
          <button
            type="button"
            class="trail-toggle"
            [attr.aria-label]="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            (click)="togglePasswordVisibility()"
          >
            <lucide-icon [name]="passwordVisible ? 'eye-off' : 'eye'" aria-hidden="true"></lucide-icon>
          </button>
        }
        <div class="focus-ring"></div>
      </div>
      
      @if (hint) {
        <span class="hint" [class.error]="error">{{ hint }}</span>
      }
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; max-width: 100%; min-width: 0; position: relative; }

    .label {
      font-size: 0.7rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      color: var(--text-muted); 
      margin-left: 0.25rem;
      font-family: var(--font-main);
      transition: all 0.2s ease;
    }

    .input-wrapper { 
      position: relative; display: flex; align-items: center; 
      --input-bg: var(--bg-secondary);
      --input-border: var(--border-soft);
      --input-radius: 12px;
      --input-color: var(--text-primary);
      --input-accent: var(--brand);
      --input-padding-v: calc(var(--page-gap, 1.5rem) * 0.5 + 0.2rem);
      --input-padding-h: calc(var(--page-gap, 1.5rem) * 0.7 + 0.3rem);
    }

    .input-wrapper:focus-within .label { color: var(--input-accent); opacity: 1; }

    /* THEMATIC COLOR TOKENS */
    .input-color-danger { --input-accent: var(--danger); }
    .input-color-success { --input-accent: var(--success); }
    .input-color-warning { --input-accent: var(--warning); }
    .input-color-info { --input-accent: var(--info); }

    .input-wrapper.has-error { --input-border: var(--danger); --input-accent: var(--danger); }

    .input-shape-glass {
      --input-bg: rgba(255, 255, 255, 0.02);
      --input-border: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(25px) saturate(1.2);
    }

    .input-wrapper.input-shape-solid {
      --input-bg: var(--bg-tertiary);
      --input-border: var(--border-soft);
    }

    /* ELEMENT BASE RULES */
    input {
      width: 100%; 
      padding: 0.75rem 1rem;
      background: var(--surface-vibrant, var(--input-bg));
      border: 1px solid var(--border-soft, var(--input-border));
      border-radius: var(--input-radius);
      color: var(--input-color);
      font-size: 0.9rem; 
      font-weight: 500;
      transition: all 0.25s ease;
      outline: none; 
      font-family: var(--font-main);
      box-shadow: var(--shadow-sm);
    }
 
    .has-icon input {
      padding-left: 3rem;
    }

    /* FOCUS STATES */
    input:focus {
      background: var(--surface-rich);
      border-color: var(--input-accent);
      box-shadow: 
        0 0 0 3px var(--brand-glow),
        var(--shadow-md);
      transform: translateY(-1px);
    }

    input::placeholder {
      color: var(--text-muted);
      opacity: 0.4;
      font-weight: 500;
    }
    
    .has-icon input { padding-left: 3.5rem; }
    .field-icon { 
      position: absolute; left: 1.4rem; width: 1.3rem; height: 1.3rem; 
      color: var(--text-muted); pointer-events: none; transition: all 0.3s;
    }
    input:focus ~ .field-icon { 
       color: var(--input-accent);
       transform: scale(1.15);
       filter: drop-shadow(0 0 10px var(--input-accent));
    }

    input:disabled { opacity: 0.4; cursor: not-allowed; }

    .hint { 
      font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; margin-left: 0.5rem; 
      font-weight: 600; opacity: 0.8;
    }
    .hint.error { color: var(--danger); opacity: 1; }

    /* Babooni Tenant Enhancements */
    :host-context(html[data-erp-tenant='babooni']) input {
      border-radius: 10px;
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

    /* Figma Login.svg: campos blancos, borde #D7D7D7, radio 8px (tenant Josanz). */
    :host-context(.auth-wrapper--figma) .input-wrapper {
      --input-bg: #ffffff;
      --input-border: #d7d7d7;
      --input-radius: 8px;
      --input-color: #222222;
      backdrop-filter: none;
      min-width: 0;
      max-width: 100%;
    }
    :host-context(.auth-wrapper--figma) .label {
      display: none;
    }
    :host-context(.auth-wrapper--figma) input {
      background: #ffffff !important;
      border-color: #d7d7d7 !important;
      color: #222222 !important;
      box-shadow: none !important;
      min-height: 43px;
      font-family: 'Raleway', 'DM Sans', system-ui, sans-serif;
      font-weight: 300;
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    :host-context(.auth-wrapper--figma) input:focus {
      background: #ffffff !important;
      box-shadow: 0 0 0 2px rgba(15, 30, 47, 0.12) !important;
      transform: none;
      border-color: #0f1e2f !important;
    }
    :host-context(.auth-wrapper--figma) input::placeholder {
      color: #7c7c7c !important;
      opacity: 1;
      font-weight: 300;
    }
    :host-context(.auth-wrapper--figma) .field-icon {
      display: none;
    }
    :host-context(.auth-wrapper--figma) .input-wrapper.has-trailing input {
      padding-right: 2.75rem !important;
    }
    :host-context(.auth-wrapper--figma) .trail-toggle {
      position: absolute;
      right: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.125rem;
      height: 1.125rem;
      padding: 0;
      border: none;
      background: transparent;
      color: #7c7c7c;
      cursor: pointer;
    }
    :host-context(.auth-wrapper--figma) .trail-toggle lucide-icon {
      width: 1.125rem;
      height: 1.125rem;
    }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() revealToggle = false;
  @Input() hint?: string;
  @Input() error = false;
  @Input() size: 'sm' | 'md' = 'md';

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
  passwordVisible = false;
  onChange: (value: string) => void = () => { /* empty */ };
  onTouched = () => { /* empty */ };

  get passwordInputType(): string {
    if (this.type !== 'password') {
      return this.type;
    }
    return this.revealToggle && this.passwordVisible ? 'text' : 'password';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  writeValue(value: string | null | undefined): void {
    this.value = value == null || value === 'undefined' ? '' : String(value);
  }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
