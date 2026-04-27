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
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
        >
        <div class="focus-ring"></div>
      </div>
      
      @if (hint) {
        <span class="hint" [class.error]="error">{{ hint }}</span>
      }
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 10px; width: 100%; position: relative; }

    .label {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--text-muted);
      margin-left: 8px; font-family: var(--font-main);
      transition: all 0.3s ease;
      opacity: 0.9;
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
      padding: var(--input-padding-v) var(--input-padding-h);
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: var(--input-radius);
      color: var(--input-color);
      font-size: 0.85rem; font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none; font-family: var(--font-main);
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    /* FOCUS STATES */
    input:focus {
      background: color-mix(in srgb, var(--input-bg) 70%, var(--input-accent) 5%);
      border-color: var(--input-accent);
      box-shadow: 
        0 0 25px color-mix(in srgb, var(--input-accent) 25%, transparent),
        inset 0 2px 10px rgba(0, 0, 0, 0.2);
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
      font-size: 0.65rem; color: var(--text-muted); margin-top: 8px; margin-left: 12px; 
      font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    }
    .hint.error { color: var(--danger); }
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
  onChange: (value: string) => void = () => { /* empty */ };
  onTouched = () => { /* empty */ };

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
