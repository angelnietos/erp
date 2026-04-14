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
      background: var(--theme-input-bg, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--theme-input-border, rgba(255, 255, 255, 0.1));
      border-radius: var(--theme-input-radius, 14px);
      color: var(--text-primary, #fff);
      font-size: 0.85rem; font-weight: 600;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none; font-family: inherit;
      resize: vertical; min-height: 120px;
      box-shadow: var(--theme-input-shadow, inset 0 2px 4px rgba(0,0,0,0.2));
    }

    textarea:focus {
      background: color-mix(in srgb, var(--theme-input-bg, rgba(255, 255, 255, 0.05)) 80%, var(--text-primary, #fff));
      border-color: var(--brand, #3b82f6);
      box-shadow:
        0 0 0 4px color-mix(in srgb, var(--brand, #3b82f6) 15%, transparent),
        var(--theme-input-shadow, 0 8px 30px -10px color-mix(in srgb, var(--brand, #3b82f6) 40%, transparent));
    }

    .textarea-glass {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .textarea-filled {
      background: color-mix(in srgb, var(--surface, rgba(24, 26, 36, 1)) 92%, var(--brand, #e60012) 8%);
      border-color: color-mix(in srgb, var(--border-vibrant, #fff) 22%, transparent);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.35);
    }

    .textarea-outlined {
      background: transparent;
      border-width: 2px;
      border-color: color-mix(in srgb, var(--text-secondary, #ccc) 45%, transparent);
      box-shadow: none;
    }

    .textarea-ghost {
      background: transparent;
      border-color: transparent;
      border-bottom: 1px solid var(--border-soft, rgba(255, 255, 255, 0.12));
      border-radius: 0;
      box-shadow: none;
    }

    .textarea-dark {
      background: #08090d;
      border-color: rgba(255, 255, 255, 0.06);
    }

    .textarea-light {
      background: rgba(248, 250, 252, 0.96);
      border-color: rgba(15, 23, 42, 0.12);
      color: #0f172a;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
    }

    .textarea-success {
      border-color: color-mix(in srgb, var(--success, #34d399) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--success, #34d399) 25%, transparent);
    }

    .textarea-warning {
      border-color: color-mix(in srgb, var(--warning, #fbbf24) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--warning, #fbbf24) 22%, transparent);
    }

    .textarea-info {
      border-color: color-mix(in srgb, var(--info, #38bdf8) 55%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--info, #38bdf8) 22%, transparent);
    }

    .textarea-rounded {
      border-radius: 999px;
    }

    .textarea-soft {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
    }

    .textarea-minimal {
      border-bottom: 2px solid var(--border-soft) !important;
      padding-left: 0; padding-right: 0;
      background: transparent !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    .textarea-error {
      border-color: var(--danger) !important;
      background: color-mix(in srgb, var(--danger) 5%, var(--theme-input-bg, transparent)) !important;
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
