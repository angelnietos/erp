import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type TextareaVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'rounded' | 'minimal' | 'soft' | 'glass';

@Component({
  selector: 'ui-textarea',
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
    .textarea-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-left: 2px;
    }

    /* Base Textarea Styles */
    textarea {
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
      resize: vertical;
      min-height: 100px;
    }

    textarea::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
    }

    textarea:focus {
      border-color: var(--brand);
      background: var(--bg-secondary);
      box-shadow: 0 0 15px var(--brand-glow);
    }

    /* Variants */
    .textarea-default {
      background: var(--bg-tertiary);
      border-color: var(--border-vibrant);
    }

    .textarea-filled {
      background: rgba(255, 255, 255, 0.05);
      border-color: transparent;
    }

    .textarea-outlined {
      background: transparent;
      border: 2px solid var(--border-vibrant);
    }

    .textarea-ghost {
      background: transparent;
      border: 1px solid transparent;
    }
    .textarea-ghost:focus {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--brand);
    }

    .textarea-dark {
      background: #000;
      border-color: #222;
    }

    .textarea-error {
      border-color: var(--danger) !important;
      background: rgba(239, 68, 68, 0.05);
    }
    
    .textarea-error:focus {
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
    }

    .textarea-success {
      border-color: var(--success);
    }

    /* Additional variants */
    .textarea-rounded {
      border-radius: 20px;
      padding: 1rem 1.5rem;
    }

    .textarea-minimal {
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--border-soft);
      border-radius: 0;
    }

    .textarea-soft {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .textarea-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    textarea.error { border-color: var(--danger) !important; }
    textarea:disabled {
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
