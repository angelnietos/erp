import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import {
  josanzControlErrorMessage,
  josanzControlHasError,
  josanzControlIsRequired,
} from '../validators/josanz-form-validators';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-2 w-full mb-4" [formGroup]="parentForm">
      @if (label) {
        <label
          [style.color]="'var(--josanz-label-muted)'"
          class="text-[11px] font-bold uppercase tracking-[0.1em] ml-1"
          [attr.for]="controlName || null"
        >
          {{ label }}
          @if (showRequiredMarker) {
            <span class="text-[color:var(--josanz-danger)]" aria-hidden="true"> *</span>
          }
        </label>
      }
      <div class="relative flex items-center group">
        <input
          [id]="controlName || null"
          [formControlName]="controlName"
          [type]="type"
          [placeholder]="placeholder"
          [class]="inputClasses"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.color]="'var(--josanz-field-text, var(--josanz-text))'"
          [style.borderColor]="borderColor()"
          [style.boxShadow]="focusRing()"
          [attr.aria-invalid]="hasError"
          [attr.aria-describedby]="hasError ? controlName + '-error' : null"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
        />
      </div>
      @if (errorText) {
        <p
          [id]="controlName + '-error'"
          class="m-0 ml-1 text-xs font-medium"
          style="color: var(--josanz-danger)"
          role="alert"
        >
          {{ errorText }}
        </p>
      }
    </div>
  `,
})
export class InputComponent {
  public themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() controlName = '';
  @Input() parentForm!: FormGroup;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  /** Fuerza el asterisco de obligatorio aunque el validador sea custom. */
  @Input() required = false;

  isFocused = false;

  get control() {
    return this.parentForm?.get(this.controlName) ?? null;
  }

  get showRequiredMarker(): boolean {
    return this.required || josanzControlIsRequired(this.control);
  }

  get hasError(): boolean {
    return josanzControlHasError(this.control);
  }

  get errorText(): string {
    return josanzControlErrorMessage(this.control);
  }

  get inputClasses() {
    const base =
      'w-full h-[44px] px-4 border border-solid text-[14px] font-medium transition-all outline-none placeholder:text-[color:var(--josanz-text-muted)]';
    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;
    const shapes = {
      rounded: 'rounded-[var(--josanz-radius-control)]',
      pill: 'rounded-full',
      square: 'rounded-none',
      field: 'rounded-[var(--josanz-radius-control)]',
      inner: 'rounded-[6px]',
      modal: 'rounded-[24px]',
      avatar: 'rounded-[var(--josanz-radius-control)]',
    };
    return [base, shapes[activeShape as keyof typeof shapes] || shapes.rounded, 'hover:brightness-[0.99]'].join(' ');
  }

  getAccentColor(): string {
    if (this.customColor) {
      return this.customColor;
    }
    if (typeof document !== 'undefined') {
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue('--josanz-interactive')
        .trim();
      if (token) {
        return token;
      }
    }
    return this.themeService.currentTheme().primaryColor;
  }

  borderColor(): string {
    if (this.hasError) {
      return 'var(--josanz-danger)';
    }
    if (this.isFocused || this.customColor) {
      return this.getAccentColor();
    }
    return 'var(--josanz-stroke-field)';
  }

  focusRing(): string {
    if (!this.isFocused) {
      return 'none';
    }
    const c = this.hasError ? 'var(--josanz-danger)' : this.getAccentColor();
    return `0 0 0 2px color-mix(in srgb, ${c} 35%, transparent)`;
  }
}
