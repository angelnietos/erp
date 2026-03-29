import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info';

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
      gap: 8px;
      width: 100%;
    }

    .label {
      font-size: 13px;
      font-weight: 500;
      margin-left: 4px;
    }

    .label, .hint {
      color: var(--theme-text-muted, #64748B);
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
      color: var(--theme-text-muted, #64748B);
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.2s ease;
      outline: none;
      font-family: inherit;
    }

    .has-icon input {
      padding-left: 42px;
    }

    /* Variants */
    .input-default {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }

    .input-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }

    .input-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }

    .input-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }

    .input-ghost:focus {
      background: var(--theme-surface, #FFFFFF);
    }

    .input-dark {
      background: #1E293B;
      border: 1px solid #334155;
      color: white;
    }

    .input-dark::placeholder {
      color: #94A3B8;
    }

    .input-light {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }

    .input-error {
      border-color: #EF4444;
      background: #FEF2F2;
    }

    .input-success {
      border-color: #10B981;
      background: #ECFDF5;
    }

    .input-warning {
      border-color: #F59E0B;
      background: #FFFBEB;
    }

    .input-info {
      border-color: #0EA5E9;
      background: #F0F9FF;
    }

    input:focus {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }

    input.invalid {
      border-color: #EF4444;
    }

    input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .hint {
      font-size: 12px;
    }

    .hint.error {
      color: #EF4444;
    }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() icon: any = '';
  @Input() hint?: string;
  @Input() variant: InputVariant = 'default';
  @Input() error = false;

  value = '';
  disabled = false;
  onChange = (_value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void { this.value = value; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
