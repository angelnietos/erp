import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'theme';

@Component({
  selector: 'ui-josanz-input',
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
    <div class="form-group">
      @if (label) { <label [for]="id" class="label">{{ label }}</label> }
      <div class="input-wrapper" [class.has-icon]="icon">
        @if (icon) { <lucide-icon [name]="icon" class="field-icon"></lucide-icon> }
        <input 
          [id]="id" 
          [type]="type" 
          [placeholder]="placeholder" 
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class]="'input-' + variant"
          [class.invalid]="error"
        >
      </div>
      @if (hint) {
        <span class="hint" [class.error]="error">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-left: 2px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 14px;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      pointer-events: none;
      transition: color 0.3s ease;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-soft);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.9rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
      font-family: var(--font-main);
    }

    input::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
    }

    .has-icon input {
      padding-left: 44px;
    }

    input:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }
    
    .has-icon input:focus + .field-icon,
    input:focus ~ .field-icon {
      color: var(--brand);
    }

    /* Variants mapping to gaming aesthetics */
    .input-theme, .input-default {
      background: var(--bg-tertiary);
      border-color: var(--border-vibrant);
    }

    .input-filled {
      background: rgba(255, 255, 255, 0.05);
      border-color: transparent;
    }

    .input-outlined {
      background: transparent;
      border: 2px solid var(--border-vibrant);
    }

    .input-ghost {
      background: transparent;
      border: 1px solid transparent;
    }
    .input-ghost:focus {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--brand);
    }

    .input-dark {
      background: #000;
      border-color: #222;
    }

    .input-error {
      border-color: var(--danger) !important;
      background: rgba(239, 68, 68, 0.05);
    }
    
    .input-error:focus {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .input-success {
      border-color: var(--success);
    }

    input.invalid {
      border-color: var(--danger);
    }

    input:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    .hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .hint.error {
      color: #f87171;
      font-weight: 500;
    }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() hint?: string;
  @Input() variant: InputVariant = 'default';
  @Input() error = false;

  value = '';
  disabled = false;
  onChange: (value: string) => void = () => { /* empty */ };
  onTouched = () => { /* empty */ };

  writeValue(value: string): void { this.value = value; }
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
