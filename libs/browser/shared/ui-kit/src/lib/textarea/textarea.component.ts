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
    .textarea-group { display: flex; flex-direction: column; gap: 8px; width: 100%; position: relative; }
    .label {
      font-size: 0.65rem; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--text-muted, #888);
      margin-left: 8px; font-family: inherit;
    }

    textarea {
      width: 100%; padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      color: #fff;
      font-size: 0.85rem; font-weight: 600;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none; font-family: inherit;
      resize: vertical; min-height: 120px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }

    textarea:focus {
      background: color-mix(in srgb, rgba(255,255,255,0.02) 80%, rgba(255,255,255,0.05));
      border-color: var(--brand, #3b82f6);
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--brand, #3b82f6) 15%, transparent),
        0 8px 30px -10px color-mix(in srgb, var(--brand, #3b82f6) 40%, transparent);
    }

    .textarea-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border-color: rgba(255, 255, 255, 0.06);
    }

    .textarea-minimal {
      --input-bg: transparent;
      --input-border: transparent;
      --input-radius: 0;
      --input-shadow: none;
      border-bottom: 2px solid var(--border-soft) !important;
      padding-left: 0; padding-right: 0;
    }

    .textarea-error {
      --input-border: var(--danger);
      background: rgba(239, 68, 68, 0.05);
    }

    textarea:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
    }
    
    .hint {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 4px;
      margin-left: 4px;
      font-weight: 500;
    }

    .hint.error {
      color: var(--danger);
      font-weight: 600;
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
