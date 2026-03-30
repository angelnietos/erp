import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type TextareaVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info';

@Component({
  selector: 'ui-josanz-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaComponent),
      multi: true,
    },
  ],
  template: `
    <div class="textarea-group">
      @if (label) { <label [for]="id" class="label">{{ label }}</label> }
      <textarea 
        [id]="id" 
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [disabled]="disabled"
        [rows]="rows"
        [class]="'textarea-' + variant"
        [class.error]="error"
      ></textarea>
      @if (hint) { <span class="hint" [class.error]="error">{{ hint }}</span> }
    </div>
  `,
  styles: [`
    .textarea-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .label { color: var(--theme-text-muted, #64748B); font-size: 13px; font-weight: 500; }

    /* Base Textarea Styles */
    textarea {
      width: 100%; padding: 12px 14px; border-radius: 12px;
      font-size: 14px; transition: all 0.2s ease; outline: none;
      font-family: inherit; resize: vertical;
    }

    /* Variants */
    .textarea-default {
      background: var(--theme-surface, #FFFFFF);
      border: 1px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .textarea-default:focus {
      border-color: var(--theme-primary, #4F46E5);
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
    }

    .textarea-filled {
      background: var(--theme-background, #F8FAFC);
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .textarea-filled:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .textarea-outlined {
      background: transparent;
      border: 2px solid var(--theme-border, #E2E8F0);
      color: var(--theme-text, #1E293B);
    }
    .textarea-outlined:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .textarea-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: var(--theme-text, #1E293B);
    }
    .textarea-ghost:focus {
      background: var(--theme-surface, #FFFFFF);
      border-color: var(--theme-border, #E2E8F0);
    }

    .textarea-dark {
      background: #1E293B;
      border: 1px solid #334155;
      color: white;
    }
    .textarea-dark::placeholder { color: #94A3B8; }
    .textarea-dark:focus {
      border-color: var(--theme-primary, #4F46E5);
      background: rgba(255, 255, 255, 0.08);
    }

    .textarea-light {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      color: #1E293B;
    }
    .textarea-light:focus {
      border-color: var(--theme-primary, #4F46E5);
    }

    .textarea-error {
      border-color: #EF4444;
      background: #FEF2F2;
      color: #DC2626;
    }
    .textarea-error:focus {
      border-color: #EF4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
    }

    .textarea-success {
      border-color: #10B981;
      background: #ECFDF5;
      color: #059669;
    }
    .textarea-success:focus {
      border-color: #10B981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
    }

    .textarea-warning {
      border-color: #F59E0B;
      background: #FFFBEB;
      color: #D97706;
    }
    .textarea-warning:focus {
      border-color: #F59E0B;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
    }

    .textarea-info {
      border-color: #0EA5E9;
      background: #F0F9FF;
      color: #0284C7;
    }
    .textarea-info:focus {
      border-color: #0EA5E9;
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
    }

    textarea.error { border-color: #EF4444 !important; }
    textarea:disabled { opacity: 0.6; cursor: not-allowed; }
    .hint { color: var(--theme-text-muted, #64748B); font-size: 12px; }
    .hint.error { color: #EF4444; }
  `],
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = false;
  @Input() disabled = false;
  @Input() rows = 4;
  @Input() variant: TextareaVariant = 'default';

  value = '';
  onChange: (value: string) => void = (value: string) => {
    this.value = value;
  };
  onTouched: () => void = () => {
    /* mark as touched */
  };

  writeValue(value: string): void { this.value = value; }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
