import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-2 w-full mb-4" [formGroup]="parentForm">
      @if (label) {
        <label
          [style.color]="'var(--josanz-label-muted)'"
          class="text-[11px] font-bold uppercase tracking-[0.1em] ml-1">
          {{ label }}
        </label>
      }
      <div class="relative flex items-center group">
        <input
          [formControlName]="controlName"
          [type]="type"
          [placeholder]="placeholder"
          [class]="inputClasses"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.color]="'var(--josanz-text)'"
          [style.borderColor]="borderColor()"
          [style.boxShadow]="focusRing()"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
        />
        @if (parentForm.get(controlName)?.invalid && parentForm.get(controlName)?.touched) {
          <span class="absolute right-3 text-[10px] font-bold uppercase tracking-wider" style="color: var(--josanz-danger)">Requerido</span>
        }
      </div>
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

  isFocused = false;

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
    if (this.isFocused || this.customColor) {
      return this.getAccentColor();
    }
    return 'var(--josanz-stroke-field)';
  }

  focusRing(): string {
    if (!this.isFocused) {
      return 'none';
    }
    const c = this.getAccentColor();
    return `0 0 0 2px color-mix(in srgb, ${c} 35%, transparent)`;
  }
}
