import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';
import {
  josanzControlErrorMessage,
  josanzControlHasError,
} from '../validators/josanz-form-validators';

export interface JosanzSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
        >
          {{ label }}
          @if (required) {
            <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
          }
        </span>
      }
      <div class="relative">
        <select
          class="h-11 w-full appearance-none border border-solid px-4 pr-10 text-sm font-bold outline-none transition-all"
          [ngClass]="cornerClass()"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="fieldBorderColor"
          [style.boxShadow]="isFocused ? focusRing() : 'none'"
          [style.color]="'var(--josanz-text)'"
          [value]="value"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-invalid]="showFieldError"
          [attr.aria-describedby]="showFieldError ? fieldErrorId : null"
          (focus)="isFocused = true"
          (blur)="onBlur()"
          (change)="selectValue($event)"
        >
          @if (placeholder) {
            <option value="" [disabled]="required">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value" [disabled]="option.disabled">
              {{ option.label }}
            </option>
          }
        </select>
        <span
          class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          [style.color]="'var(--josanz-text-muted)'"
          aria-hidden="true"
          >⌄</span
        >
      </div>
      @if (hint || fieldErrorMessage) {
        <span
          class="text-xs font-medium"
          [id]="fieldErrorId"
          [style.color]="showFieldError ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'"
          [attr.role]="showFieldError ? 'alert' : null"
        >
          {{ showFieldError ? fieldErrorMessage : hint }}
        </span>
      }
    </label>
  `,
})
export class SelectComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: JosanzSelectOption[] = [];
  @Input() value = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() override disabled = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  isFocused = false;

  constructor(@Optional() @Self() private readonly ngControl: NgControl | null) {
    super();
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  get fieldErrorId(): string {
    return `${this.label || 'select'}-error`;
  }

  get boundControl() {
    return this.ngControl?.control ?? null;
  }

  get showFieldError(): boolean {
    if (this.error) {
      return true;
    }
    return josanzControlHasError(this.boundControl);
  }

  get fieldErrorMessage(): string {
    if (this.error) {
      return this.error;
    }
    return josanzControlErrorMessage(this.boundControl);
  }

  get fieldBorderColor(): string {
    if (this.showFieldError) {
      return 'var(--josanz-danger)';
    }
    if (this.isFocused || this.customColor) {
      return this.accentColor;
    }
    return 'var(--josanz-stroke-field)';
  }

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  get accentColor(): string {
    return this.customColor || 'var(--josanz-interactive)';
  }

  onBlur(): void {
    this.isFocused = false;
    this.markTouched();
  }

  selectValue(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.emitChange(this.value);
    this.valueChange.emit(this.value);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-full';
    }
    return 'rounded-[var(--josanz-radius-control)]';
  }

  focusRing(): string {
    const color = this.showFieldError ? 'var(--josanz-danger)' : this.accentColor;
    return `0 0 0 2px color-mix(in srgb, ${color} 35%, transparent)`;
  }
}
