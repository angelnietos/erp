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
        [class]="'input-color-' + color"
        [class]="'input-shape-' + shape"
        [class]="'input-' + size"
        [class.input-auto-overrides]="shape === 'auto'"
        [class.has-icon]="icon" 
        [class.has-error]="error" 
      >
        @if (icon) { <lucide-icon [name]="icon" class="field-icon"></lucide-icon> }
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
  styles: [`
    :host {
      display: block;
    }
    .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; position: relative; }

    .label {
      font-size: 0.65rem; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--text-muted, #888);
      margin-left: 8px; font-family: inherit;
    }

    .input-wrapper { 
      position: relative; display: flex; align-items: center; 
      --input-bg: var(--theme-input-bg, rgba(255, 255, 255, 0.05));
      --input-border: var(--theme-input-border, rgba(255, 255, 255, 0.1));
      --input-radius: var(--theme-input-radius, 14px);
      --input-color: var(--text-primary, #fff);
      --input-accent: var(--brand, #3b82f6);
    }

    /* THEMATIC COLOR TOKENS */
    .input-color-default { --input-accent: var(--brand); }
    .input-color-primary { --input-accent: var(--brand); }
    .input-color-danger { --input-accent: var(--danger, #ef4444); }
    .input-color-success { --input-accent: var(--success, #10b981); }
    .input-color-warning { --input-accent: var(--warning, #f59e0b); }
    .input-color-info { --input-accent: var(--info, #3b82f6); }

    .input-wrapper.has-error { --input-border: var(--danger); --input-accent: var(--danger); }

    .input-shape-glass {
      --input-bg: var(--theme-input-bg, rgba(255, 255, 255, 0.03));
      --input-border: var(--theme-input-border, rgba(255, 255, 255, 0.06));
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    }

    /* ELEMENT BASE RULES */
    input {
      width: 100%; padding: 0.9rem 1.25rem;
      background: var(--input-bg); 
      border: 1px solid var(--input-border);
      border-radius: var(--input-radius); 
      color: var(--input-color);
      font-size: 0.85rem; font-weight: 600; 
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none; font-family: inherit;
      box-shadow: var(--theme-input-shadow, inset 0 2px 4px rgba(0,0,0,0.2));
    }

    /* FOCUS STATES */
    input:focus {
      background: color-mix(in srgb, var(--input-bg) 80%, var(--text-primary, #fff));
      border-color: var(--input-accent);
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--input-accent) 15%, transparent),
        var(--theme-input-shadow, 0 8px 30px -10px color-mix(in srgb, var(--input-accent) 40%, transparent));
    }

    input::placeholder {
      color: var(--text-muted); padding-left: 2px;
      opacity: 0.5;
      font-weight: 500;
    }
    
    .has-icon input { padding-left: 3rem; }
    .field-icon { 
      position: absolute; left: 1.15rem; width: 1.2rem; height: 1.2rem; 
      color: var(--text-muted); pointer-events: none; transition: all 0.3s;
      filter: drop-shadow(0 0 5px transparent);
    }
    input:focus ~ .field-icon { 
       color: var(--input-accent);
       transform: scale(1.1);
       filter: drop-shadow(0 0 8px color-mix(in srgb, var(--input-accent) 60%, transparent));
    }

    input:disabled { opacity: 0.4; cursor: not-allowed; }

    .hint { font-size: 0.65rem; color: var(--text-muted); margin-top: 6px; margin-left: 8px; font-weight: 600; letter-spacing: 0.02em; }
    .hint.error { color: var(--danger); text-transform: uppercase; font-size: 0.6rem; }
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
  disabled = false;
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
