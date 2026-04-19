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
    .textarea-group { display: flex; flex-direction: column; gap: 8px; width: 100%; position: relative; }
    .label {
      font-size: 0.65rem; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.15em; color: var(--text-muted, #888);
      margin-left: 8px; font-family: inherit;
    }

    textarea {
      width: 100%; padding: 1rem 1.25rem;
      background:
        var(--fld-surface-soft),
        color-mix(in srgb, var(--theme-input-bg, #12141c) 94%, var(--fld-brand) 6%);
      border: 1px solid var(--fld-border-muted);
      border-radius: var(--theme-input-radius, 14px);
      color: var(--text-primary, #fff);
      font-size: 0.85rem; font-weight: 600;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none; font-family: inherit;
      resize: vertical; min-height: 120px;
      box-shadow: var(--fld-shine-subtle), inset 0 2px 6px rgba(0, 0, 0, 0.28);
    }

    textarea:focus-visible {
      background: color-mix(in srgb, var(--theme-input-bg, #12141c) 78%, #fff 8%);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-ring-brand), var(--fld-shadow-brand), var(--fld-shine-top);
    }

    .textarea-glass {
      background: var(--fld-glass);
      backdrop-filter: blur(16px) saturate(1.12);
      -webkit-backdrop-filter: blur(16px) saturate(1.12);
      border-color: color-mix(in srgb, #fff 14%, transparent);
      box-shadow: var(--fld-shine-top), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .textarea-filled {
      background: var(--fld-surface-deep);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), inset 0 4px 14px rgba(0, 0, 0, 0.45);
    }

    .textarea-outlined {
      background: transparent;
      border-width: 2px;
      border-color: color-mix(in srgb, var(--fld-brand) 32%, rgba(148, 163, 184, 0.45));
      box-shadow: none;
    }

    .textarea-ghost {
      background: transparent;
      border-color: transparent;
      border-bottom: 2px solid color-mix(in srgb, var(--fld-brand) 28%, rgba(255, 255, 255, 0.12));
      border-radius: 0;
      box-shadow: none;
    }

    .textarea-dark {
      background: linear-gradient(180deg, #0a0b10 0%, #050508 100%);
      border-color: rgba(255, 255, 255, 0.07);
      box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.55);
    }

    .textarea-light {
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      border-color: color-mix(in srgb, var(--fld-brand) 18%, #cbd5e1);
      color: #0f172a;
      box-shadow: var(--fld-shine-top), 0 4px 18px rgba(15, 23, 42, 0.08);
    }

    .textarea-success {
      border-color: color-mix(in srgb, var(--fld-success) 62%, transparent);
      background: color-mix(in srgb, var(--fld-success) 7%, #12141c);
      box-shadow: var(--fld-glow-success);
    }

    .textarea-warning {
      border-color: color-mix(in srgb, var(--fld-warning) 58%, transparent);
      background: color-mix(in srgb, var(--fld-warning) 8%, #12141c);
      box-shadow: var(--fld-glow-warning);
    }

    .textarea-info {
      border-color: color-mix(in srgb, var(--fld-info) 58%, transparent);
      background: color-mix(in srgb, var(--fld-info) 8%, #12141c);
      box-shadow: var(--fld-glow-info);
    }

    .textarea-rounded {
      border-radius: 999px;
    }

    .textarea-soft {
      background: var(--fld-glass);
      border-color: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: var(--fld-shine-top), var(--fld-shadow-float);
    }

    .textarea-minimal {
      border-bottom: 2px solid color-mix(in srgb, var(--fld-brand) 22%, var(--border-soft, rgba(255, 255, 255, 0.12))) !important;
      padding-left: 0; padding-right: 0;
      background: transparent !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    .textarea-error {
      border-color: var(--fld-danger) !important;
      background: color-mix(in srgb, var(--fld-danger) 9%, #14161f) !important;
      box-shadow: var(--fld-glow-danger) !important;
    }

    textarea:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
    }

    :host-context(html[data-erp-tenant='babooni']) textarea:not(.textarea-dark):not(.textarea-light) {
      background:
        linear-gradient(
          180deg,
          var(--theme-surface, #fffefe) 0%,
          color-mix(in srgb, var(--theme-surface, #fffefe) 88%, var(--bg-secondary, #f7f7f7)) 100%
        ),
        color-mix(in srgb, var(--theme-surface, #fffefe) 94%, var(--fld-brand) 6%);
      border: 1px solid var(--border-soft, rgba(8, 8, 8, 0.1));
      color: var(--text-primary, #080808);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.85) inset, 0 1px 2px rgba(8, 8, 8, 0.06);
      color-scheme: light;
    }

    :host-context(html[data-erp-tenant='babooni']) textarea:not(.textarea-dark):not(.textarea-light):focus-visible {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 82%, var(--fld-brand) 10%);
      border-color: var(--fld-border-brand);
    }

    :host-context(html[data-erp-tenant='babooni']) .textarea-glass,
    :host-context(html[data-erp-tenant='babooni']) .textarea-soft {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    
    .hint {
      font-size: 0.72rem;
      color: var(--text-muted);
      margin-top: 4px;
      margin-left: 4px;
      font-weight: 500;
    }

    .hint.error {
      color: var(--fld-danger);
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
