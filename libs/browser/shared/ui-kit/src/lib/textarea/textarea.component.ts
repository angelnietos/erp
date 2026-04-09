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
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-left: 12px;
      font-family: var(--font-display);
    }

    textarea {
      width: 100%;
      padding: 1rem 1.25rem;
      background: var(--input-bg, var(--bg-tertiary));
      border: 1px solid var(--input-border, var(--border-soft));
      border-radius: var(--input-radius, var(--radius-md));
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.3s var(--ease-out-expo);
      outline: none;
      font-family: var(--font-main);
      resize: vertical;
      min-height: 120px;
      box-shadow: var(--input-shadow, inset 0 2px 4px rgba(0,0,0,0.1));
      box-sizing: border-box;
    }

    textarea::placeholder {
      color: var(--text-muted);
      opacity: 0.5;
    }

    textarea:focus {
      background: color-mix(in srgb, var(--input-bg, var(--bg-tertiary)) 92%, #fff);
      border-color: var(--brand);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--brand) 22%, transparent),
        0 12px 28px -8px var(--brand-glow);
    }

    /* Variants mapping to tokens */
    .textarea-glass {
      --input-bg: rgba(255, 255, 255, 0.05);
      --input-border: var(--border-vibrant);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
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
