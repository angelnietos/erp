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
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .textarea-group { display: flex; flex-direction: column; gap: 10px; width: 100%; position: relative; }
    .label {
      font-size: 0.7rem; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.2em; color: var(--text-muted);
      margin-left: 12px; font-family: var(--font-display);
    }

    textarea {
      width: 100%; padding: 1.25rem 1.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.9rem; font-weight: 600;
      transition: all 0.4s var(--transition-spring);
      outline: none; font-family: inherit;
      resize: vertical; min-height: 120px;
      box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    textarea:focus {
      background: color-mix(in srgb, var(--bg-secondary) 70%, var(--brand) 5%);
      border-color: var(--brand);
      box-shadow: 
        0 0 25px color-mix(in srgb, var(--brand) 25%, transparent),
        inset 0 2px 10px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }

    .textarea-glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px) saturate(1.5);
      border-color: rgba(255, 255, 255, 0.08);
    }

    .textarea-success {
      border-color: var(--success);
      background: color-mix(in srgb, var(--success) 5%, var(--bg-secondary));
    }

    .textarea-warning {
      border-color: var(--warning);
      background: color-mix(in srgb, var(--warning) 5%, var(--bg-secondary));
    }

    .textarea-error {
      border-color: var(--danger);
      background: color-mix(in srgb, var(--danger) 5%, var(--bg-secondary));
      box-shadow: 0 0 20px color-mix(in srgb, var(--danger) 20%, transparent);
    }

    textarea:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .hint {
      font-size: 0.65rem; color: var(--text-muted); margin-top: 8px; margin-left: 12px; 
      font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    }
    .hint.error { color: var(--danger); }
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
