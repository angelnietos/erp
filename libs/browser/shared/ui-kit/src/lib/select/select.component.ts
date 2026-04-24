import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type SelectVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'dark' | 'light' | 'error' | 'success' | 'warning' | 'info' | 'theme' | 'primary' | 'secondary' | 'transparent' | 'minimal' | 'rounded' | 'glass' | 'soft';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="form-group">
      @if (label) { <label [for]="id">{{ label }}</label> }
      <div class="select-wrapper">
        <select
          [id]="id"
          (change)="onSelect($event)"
          (blur)="onBlur()"
          [disabled]="disabled"
          [class]="'select-' + variant + (size === 'sm' ? ' select-sm' : '')"
          [class.invalid]="error"
        >
          @if (placeholder) {
            <option value="" disabled [selected]="!value">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [selected]="value === option.value">
              {{ option.label }}
            </option>
          }
        </select>
        <div class="chevron"></div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/form-field-visual.scss'],
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    label { 
      font-size: 0.65rem; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 0.15em; 
      color: var(--text-muted, #888); 
      margin-left: 8px; 
    }
    .select-wrapper {
      position: relative;
      display: flex;
      align-items: stretch;
      border-radius: inherit;
    }

    /* Base — relieve suave + coherencia con marca */
    select {
      width: 100%;
      padding: 0.9rem 2.5rem 0.9rem 1.25rem;
      background:
        var(--fld-surface-soft),
        color-mix(in srgb, var(--theme-input-bg, #12141c) 94%, var(--fld-brand) 6%);
      border: 1px solid var(--fld-border-muted);
      border-radius: var(--theme-input-radius, 14px);
      color: var(--text-primary, #fff);
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.35;
      letter-spacing: 0.01em;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease,
        transform 0.15s ease;
      outline: none;
      font-family: inherit;
      appearance: none;
      cursor: pointer;
      box-shadow: var(--fld-shine-subtle), inset 0 2px 6px rgba(0, 0, 0, 0.28);
    }

    select:not(:disabled):hover {
      border-color: color-mix(in srgb, var(--fld-brand) 38%, var(--fld-border-muted));
      box-shadow:
        var(--fld-shine-subtle),
        inset 0 2px 6px rgba(0, 0, 0, 0.22),
        0 4px 14px -6px color-mix(in srgb, var(--fld-brand) 25%, transparent);
    }

    :host-context(html[data-theme-is-light='true']) select {
      color-scheme: light;
      box-shadow: var(--fld-shine-subtle), inset 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    :host-context(html[data-theme-is-light='false']) select {
      color-scheme: dark;
    }

    .select-sm {
      padding: 0.55rem 2.35rem 0.55rem 0.95rem !important;
      font-size: 0.78rem !important;
      border-radius: 12px !important;
    }

    select:focus-visible {
      background: color-mix(in srgb, var(--theme-input-bg, #12141c) 78%, #fff 8%);
      border-color: var(--fld-border-brand);
      box-shadow: 
        0 0 0 4px color-mix(in srgb, var(--fld-brand) 15%, transparent),
        0 15px 35px -12px color-mix(in srgb, var(--fld-brand) 45%, transparent),
        var(--fld-shine-top);
      outline: none;
      transform: translateY(-1px);
    }

    .select-default {
      /* hereda base */
    }

    .select-filled {
      background: var(--fld-surface-deep);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), inset 0 4px 14px rgba(0, 0, 0, 0.45);
    }

    .select-outlined {
      background: transparent;
      border-width: 2px;
      border-color: color-mix(in srgb, var(--fld-brand) 35%, rgba(148, 163, 184, 0.45));
      box-shadow: none;
    }

    .select-ghost {
      background: transparent;
      border-color: transparent;
      border-bottom: 2px solid color-mix(in srgb, var(--fld-brand) 28%, rgba(255, 255, 255, 0.12));
      border-radius: 0;
      box-shadow: none;
    }

    .select-dark {
      background: linear-gradient(180deg, #0a0b10 0%, #050508 100%);
      border-color: rgba(255, 255, 255, 0.07);
      box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.6);
    }

    .select-light {
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      border-color: color-mix(in srgb, var(--fld-brand) 18%, #cbd5e1);
      color: #0f172a;
      box-shadow: var(--fld-shine-top), 0 4px 18px rgba(15, 23, 42, 0.08);
      color-scheme: light;
    }

    .select-light option {
      background: #f8fafc;
      color: #0f172a;
    }

    .select-error {
      border-color: color-mix(in srgb, var(--fld-danger) 72%, transparent) !important;
      background: color-mix(in srgb, var(--fld-danger) 9%, #14161f) !important;
      box-shadow: var(--fld-glow-danger);
    }

    .select-success {
      border-color: color-mix(in srgb, var(--fld-success) 62%, transparent);
      background: color-mix(in srgb, var(--fld-success) 7%, #12141c);
      box-shadow: var(--fld-glow-success);
    }

    .select-warning {
      border-color: color-mix(in srgb, var(--fld-warning) 58%, transparent);
      background: color-mix(in srgb, var(--fld-warning) 8%, #12141c);
      box-shadow: var(--fld-glow-warning);
    }

    .select-info {
      border-color: color-mix(in srgb, var(--fld-info) 58%, transparent);
      background: color-mix(in srgb, var(--fld-info) 8%, #12141c);
      box-shadow: var(--fld-glow-info);
    }

    .select-primary {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--fld-brand) 32%, #1a0a0c) 0%,
        color-mix(in srgb, var(--fld-brand) 12%, #0f1016) 100%
      );
      border-color: color-mix(in srgb, var(--fld-brand) 58%, rgba(255, 255, 255, 0.1));
      box-shadow: var(--fld-shine-top), var(--fld-shadow-float);
    }

    .select-secondary {
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%);
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: var(--fld-shine-subtle), 0 8px 28px rgba(0, 0, 0, 0.2);
    }

    .select-theme {
      background: linear-gradient(
        125deg,
        color-mix(in srgb, var(--fld-brand) 22%, transparent) 0%,
        rgba(255, 255, 255, 0.06) 45%,
        rgba(0, 0, 0, 0.2) 100%
      );
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-shine-top), 0 12px 36px -14px color-mix(in srgb, var(--fld-brand) 45%, transparent);
    }

    .select-transparent {
      background: transparent;
      border-style: dashed;
      border-color: color-mix(in srgb, var(--fld-brand) 25%, rgba(255, 255, 255, 0.2));
      box-shadow: none;
    }

    .select-minimal {
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--fld-border-muted);
      font-size: 0.8rem;
    }

    .select-rounded {
      border-radius: 999px;
    }

    .select-soft {
      background: var(--fld-glass);
      border-color: rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: var(--fld-shine-top), var(--fld-shadow-float);
    }

    .select-soft:not(:disabled):hover {
      border-color: color-mix(in srgb, var(--fld-brand) 42%, rgba(255, 255, 255, 0.12));
    }

    .select-glass {
      background: var(--fld-glass);
      backdrop-filter: blur(16px) saturate(1.15);
      -webkit-backdrop-filter: blur(16px) saturate(1.15);
      border-color: color-mix(in srgb, #fff 16%, transparent);
      box-shadow: var(--fld-shine-top), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    select.invalid {
      border-color: var(--fld-danger) !important;
      box-shadow: var(--fld-glow-danger) !important;
    }
    select:disabled { opacity: 0.4; cursor: not-allowed; }

    .chevron {
      position: absolute;
      right: 1rem;
      top: 50%;
      width: 0.55rem;
      height: 0.55rem;
      border-right: 2.5px solid var(--text-muted, #888);
      border-bottom: 2.5px solid var(--text-muted, #888);
      transform: translateY(-55%) rotate(45deg);
      pointer-events: none;
      transition:
        border-color 0.2s ease,
        transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
        filter 0.2s ease;
      opacity: 0.92;
    }

    select:focus-visible + .chevron {
      border-right-color: var(--fld-brand);
      border-bottom-color: var(--fld-brand);
      transform: translateY(-30%) rotate(225deg);
      filter: drop-shadow(0 0 8px color-mix(in srgb, var(--fld-brand) 45%, transparent));
    }

    .select-wrapper:hover .chevron {
      opacity: 1;
      border-right-color: color-mix(in srgb, var(--fld-brand) 55%, var(--text-muted));
      border-bottom-color: color-mix(in srgb, var(--fld-brand) 55%, var(--text-muted));
    }

    option {
      background-color: var(--theme-input-bg, #12141c);
      color: var(--text-primary, #ffffff);
      font-weight: 600;
      padding: 0.45rem 0.65rem;
    }

    /**
     * Babooni: el select base asume campo “oscuro” (texto claro + color-scheme dark).
     * En tenant Babooni el kit fija texto oscuro sobre superficies claras → contraste ilegible.
     * Aquí alineamos fondo, texto, options y bordes con tokens de ThemeService (también con variantes premium).
     */
    :host-context(html[data-erp-tenant='babooni']) {
      --fld-border-muted: color-mix(in srgb, var(--text-primary, #080808) 14%, transparent);
      --fld-border-brand: color-mix(in srgb, var(--fld-brand) 52%, rgba(8, 8, 8, 0.14));
      --fld-surface-soft: linear-gradient(
        180deg,
        var(--theme-surface, #fffefe) 0%,
        color-mix(in srgb, var(--theme-surface, #fffefe) 88%, var(--bg-secondary, #f7f7f7)) 100%
      );
      --fld-glass: linear-gradient(
        155deg,
        color-mix(in srgb, var(--theme-surface, #fffefe) 92%, var(--fld-brand) 8%) 0%,
        color-mix(in srgb, var(--bg-secondary, #f7f7f7) 94%, var(--fld-brand) 6%) 100%
      );
    }

    :host-context(html[data-erp-tenant='babooni']) select {
      background:
        var(--fld-surface-soft),
        color-mix(in srgb, var(--theme-surface, #fffefe) 94%, var(--fld-brand) 6%);
      border: 1px solid var(--border-soft, rgba(8, 8, 8, 0.1));
      color: var(--text-primary, #080808);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.85) inset,
        0 1px 2px rgba(8, 8, 8, 0.06);
      color-scheme: light;
    }

    :host-context(html[data-erp-tenant='babooni']) select:not(:disabled):hover {
      border-color: color-mix(in srgb, var(--fld-brand) 32%, rgba(8, 8, 8, 0.12));
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.92) inset,
        0 2px 10px rgba(8, 8, 8, 0.06);
    }

    :host-context(html[data-erp-tenant='babooni']) select:focus-visible {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 82%, var(--fld-brand) 10%);
      border-color: var(--fld-border-brand);
      box-shadow: var(--fld-ring-brand), 0 6px 20px rgba(8, 8, 8, 0.08);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-filled,
    :host-context(html[data-erp-tenant='babooni']) .select-soft,
    :host-context(html[data-erp-tenant='babooni']) .select-glass,
    :host-context(html[data-erp-tenant='babooni']) .select-secondary,
    :host-context(html[data-erp-tenant='babooni']) .select-theme,
    :host-context(html[data-erp-tenant='babooni']) .select-minimal {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 92%, var(--fld-brand) 8%);
      border-color: var(--border-soft, rgba(8, 8, 8, 0.1));
      color: var(--text-primary);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 1px 3px rgba(8, 8, 8, 0.05);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    :host-context(html[data-erp-tenant='babooni']) .select-soft:not(:disabled):hover {
      background: color-mix(in srgb, var(--theme-surface, #fffefe) 86%, var(--fld-brand) 14%);
      border-color: color-mix(in srgb, var(--fld-brand) 38%, rgba(8, 8, 8, 0.1));
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.95) inset,
        0 4px 16px -4px color-mix(in srgb, var(--fld-brand) 22%, transparent);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-outlined {
      background: transparent;
      border-color: color-mix(in srgb, var(--fld-brand) 35%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-ghost {
      border-bottom-color: color-mix(in srgb, var(--fld-brand) 40%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-primary {
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--fld-brand) 22%, var(--theme-surface)) 0%,
        color-mix(in srgb, var(--fld-brand) 10%, var(--bg-secondary)) 100%
      );
      border-color: color-mix(in srgb, var(--fld-brand) 45%, rgba(8, 8, 8, 0.12));
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) .select-error,
    :host-context(html[data-erp-tenant='babooni']) .select-success,
    :host-context(html[data-erp-tenant='babooni']) .select-warning,
    :host-context(html[data-erp-tenant='babooni']) .select-info {
      color: var(--text-primary);
    }

    :host-context(html[data-erp-tenant='babooni']) option {
      background-color: var(--theme-surface, #fffefe);
      color: var(--text-primary, #080808);
      font-weight: 500;
      padding: 0.5rem 0.75rem;
    }

    :host-context(html[data-erp-tenant='babooni']) .chevron {
      border-right-color: var(--text-muted, #646464);
      border-bottom-color: var(--text-muted, #646464);
    }

  `],
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: { label: string, value: unknown }[] = [];
  @Input() error = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() variant: SelectVariant = 'default';

  value: unknown = '';
  disabled = false;
  onChange: (value: unknown) => void = () => {
    /* CVA stub; registerOnChange replaces this */
  };
  onTouched = () => {
    // Standard Angular ControlValueAccessor placeholder
  };

  writeValue(value: unknown): void { this.value = value; }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
  onBlur(): void { this.onTouched(); }
}
