import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type InputVariant = 'default' | 'filled' | 'ghost' | 'glass';

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
    <div class="form-group" [class.disabled]="disabled">
      @if (label) { <label [for]="id" class="label">{{ label }}</label> }
      <div class="input-wrapper" [class.has-icon]="icon" [class.has-error]="error">
        @if (icon) { <lucide-icon [name]="icon" class="field-icon"></lucide-icon> }
        <input 
          [id]="id" 
          [type]="type" 
          [placeholder]="placeholder" 
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class.ui-glass]="variant === 'glass'"
          [class.ui-filled]="variant === 'filled'"
          [class.ui-ghost]="variant === 'ghost'"
        >
        <div class="focus-ring"></div>
      </div>
      @if (hint) {
        <span class="hint" [class.error]="error">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; position: relative; }

    .label {
      font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; color: var(--text-secondary);
      margin-left: 4px; font-family: var(--font-display);
    }

    .input-wrapper { position: relative; display: flex; align-items: center; }

    .field-icon {
      position: absolute; left: 1.1rem; width: 1.1rem; height: 1.1rem;
      color: var(--text-muted); pointer-events: none; transition: var(--transition-base);
    }

    input {
      width: 100%; padding: 0.9rem 1.1rem;
      background: var(--bg-tertiary); border: 1px solid var(--border-soft);
      border-radius: var(--radius-md); color: var(--text-primary);
      font-size: 0.85rem; font-weight: 500; transition: var(--transition-base);
      outline: none; font-family: var(--font-main);
    }

    input::placeholder { color: var(--text-muted); opacity: 0.4; }

    .has-icon input { padding-left: 3rem; }

    input:focus {
      background: var(--bg-secondary); border-color: var(--brand);
      box-shadow: 0 0 20px var(--brand-glow);
    }
    
    input:focus ~ .field-icon { color: var(--brand); }

    .has-error input { border-color: var(--danger) !important; }
    .has-error input:focus { box-shadow: 0 0 20px rgba(255, 75, 75, 0.2) !important; }

    input:disabled { opacity: 0.5; cursor: not-allowed; }

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
