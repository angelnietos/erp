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
      font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.12em; color: var(--text-muted);
      margin-left: 12px; font-family: var(--font-display);
    }

    .input-wrapper { 
      position: relative; display: flex; align-items: center; 
      /* DOM inherited defaults */
      --input-bg: var(--surface, rgba(255, 255, 255, 0.02));
      --input-border: var(--border-soft);
      --input-radius: var(--radius-md, 8px);
      --input-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      --input-color: var(--text-primary);
      --input-glow: var(--brand-glow);
      --input-focus: var(--brand);
    }

    /* THEMATIC COLOR TOKENS */
    .input-color-default { --input-focus: var(--brand); --input-glow: var(--brand-glow); }
    .input-color-primary { --input-bg: color-mix(in srgb, var(--brand) 10%, transparent); --input-border: color-mix(in srgb, var(--brand) 40%, transparent); --input-focus: var(--brand); --input-glow: var(--brand-glow); }
    .input-color-danger { --input-border: var(--danger); --input-focus: var(--danger); --input-glow: rgba(239, 68, 68, 0.4); }
    .input-color-success { --input-border: var(--success); --input-focus: var(--success); --input-glow: rgba(16, 185, 129, 0.4); }
    .input-color-warning { --input-border: var(--warning); --input-focus: var(--warning); --input-glow: rgba(245, 158, 11, 0.4); }
    .input-color-info { --input-border: var(--info); --input-focus: var(--info); --input-glow: rgba(59, 130, 246, 0.4); }

    /* ERROR OVERRIDE */
    .input-wrapper.has-error { --input-border: var(--danger); --input-focus: var(--danger); --input-glow: rgba(239, 68, 68, 0.4); }

    /* STRUCTURAL SHAPES */
    .input-shape-auto {
      /* Adopts native HTML Token variables */
    }

    .input-shape-solid {
      --input-bg: var(--bg-secondary);
      --input-border: var(--brand);
      --input-radius: 0px;
      --input-shadow: 4px 4px 0px rgba(0,0,0,0.5);
    }

    .input-shape-glass {
      --input-bg: rgba(255, 255, 255, 0.05);
      --input-border: var(--border-vibrant);
      --input-radius: var(--radius-md);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    }

    .input-shape-flat {
      --input-bg: var(--bg-secondary);
      --input-border: var(--text-primary);
      --input-radius: 0px;
      --input-shadow: none;
      border-width: 2px;
    }

    .input-shape-neumorphic {
      --input-bg: var(--bg-primary);
      --input-border: transparent;
      --input-radius: 30px;
      --input-shadow: inset -4px -4px 10px rgba(255,255,255,0.02), inset 4px 4px 10px rgba(0,0,0,0.4);
    }

    .input-shape-minimal {
      --input-bg: transparent;
      --input-border: transparent;
      --input-radius: 0;
      --input-shadow: none;
      border-bottom: 2px solid var(--border-soft) !important;
    }

    .input-shape-rounded {
      --input-radius: 50px;
    }
    
    .input-sm input { padding: 0.4rem 0.75rem; font-size: 0.75rem; }
    .input-sm .field-icon { left: 0.75rem; width: 0.9rem; height: 0.9rem; }
    .input-sm.has-icon input { padding-left: 2.2rem; }

    /* ELEMENT BASE RULES */
    input {
      width: 100%; padding: 0.8rem 1.25rem;
      background: var(--input-bg, rgba(255, 255, 255, 0.02)); 
      border: 1px solid var(--input-border, var(--border-soft));
      border-radius: var(--input-radius, var(--radius-md, 8px)); 
      color: var(--input-color, var(--text-primary));
      font-size: 0.8rem; font-weight: 600; 
      transition: all var(--transition-base, 0.3s ease);
      outline: none; font-family: var(--font-main);
      box-shadow: var(--input-shadow, inset 0 2px 4px rgba(0,0,0,0.1));
      box-sizing: border-box;
    }

    /* shape-auto: reads JS-injected tokens from ThemeService */
    .input-shape-auto input {
      background: var(--input-bg, rgba(255, 255, 255, 0.02));
      border: 1px solid var(--input-border, var(--border-soft));
      border-radius: var(--input-radius, var(--radius-md, 8px));
      box-shadow: var(--input-shadow, inset 0 2px 4px rgba(0,0,0,0.1));
    }

    .input-shape-underline input { border-bottom: 2px solid var(--border-soft); }
    .input-shape-minimal input { border-bottom: 1px solid var(--border-soft); padding-left: 0; padding-right: 0; }
    .input-shape-rounded input { padding-left: 1.5rem; padding-right: 1.5rem; }

    /* FOCUS STATES */
    input:focus {
      background: color-mix(in srgb, var(--input-bg) 92%, #fff);
      border-color: var(--input-focus);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--input-focus) 22%, transparent),
        0 12px 28px -8px var(--input-glow);
    }

    input:focus-visible {
      outline: 2px solid var(--ring-focus, color-mix(in srgb, var(--input-focus) 50%, transparent));
      outline-offset: 2px;
    }

    .input-shape-underline input:focus {
      box-shadow: none; border-bottom-color: var(--input-focus); background: transparent;
    }
    .input-shape-minimal input:focus {
      box-shadow: none; border-bottom-color: var(--input-focus); background: transparent;
    }
    .input-shape-neumorphic input:focus {
      box-shadow: inset -6px -6px 12px rgba(255,255,255,0.02), inset 6px 6px 12px rgba(0,0,0,0.6);
      border-color: var(--input-focus);
    }
    
    input::placeholder {
      color: var(--text-muted);
      opacity: 0.62;
      font-weight: 500;
    }
    
    .has-icon input { padding-left: 2.75rem; }
    .field-icon { 
      position: absolute; left: 1rem; width: 1.1rem; height: 1.1rem; 
      color: var(--text-muted); pointer-events: none; transition: 0.3s;
    }
    input:focus ~ .field-icon,
    input:not(:placeholder-shown) ~ .field-icon { color: var(--input-focus); }

    .input-wrapper.has-error .field-icon { color: var(--danger); }

    input:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(0.5); }

    .hint { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; margin-left: 4px; font-weight: 500; }
    .hint.error { color: var(--danger); font-weight: 600; }
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
