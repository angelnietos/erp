import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-password-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]" [style.color]="'var(--josanz-label-muted)'">{{ label }}</span>
      }
      <span class="relative flex items-center">
        <input
          class="h-11 w-full border border-solid px-4 pr-24 text-sm font-bold outline-none transition-all"
          [ngClass]="cornerClass()"
          [type]="visible ? 'text' : 'password'"
          [style.backgroundColor]="'var(--josanz-field-fill)'"
          [style.borderColor]="error ? 'var(--josanz-danger)' : 'var(--josanz-stroke-field)'"
          [style.color]="'var(--josanz-text)'"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.autocomplete]="autocomplete"
          (input)="updateValue($event)"
          (blur)="markTouched()"
        />
        <button
          type="button"
          class="absolute right-2 rounded-full border border-solid bg-transparent px-3 py-1 text-[10px] font-black uppercase tracking-wider"
          [style.borderColor]="'var(--josanz-border)'"
          [style.color]="'var(--josanz-text-muted)'"
          (click)="visible = !visible"
        >
          {{ visible ? 'Ocultar' : 'Mostrar' }}
        </button>
      </span>
      @if (showStrength && value) {
        <div class="grid gap-1.5" aria-live="polite">
          <div class="flex gap-1">
            @for (segment of strengthSegments(); track $index) {
              <span
                class="h-1 flex-1 rounded-full transition-colors"
                [style.backgroundColor]="segment ? strengthColor() : 'color-mix(in srgb, var(--josanz-text-muted) 20%, transparent)'"
              ></span>
            }
          </div>
          <span class="text-[10px] font-black uppercase tracking-wider" [style.color]="strengthColor()">{{ strengthLabel() }}</span>
        </div>
      }
      @if (hint || error) {
        <span class="ml-1 text-xs font-semibold" [style.color]="error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'">{{ error || hint }}</span>
      }
    </label>
  `,
})
export class PasswordInputComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Contraseña';
  @Input() placeholder = '••••••••';
  @Input() hint = '';
  @Input() error = '';
  @Input() value = '';
  @Input() autocomplete = 'current-password';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() showStrength = false;

  @Output() valueChange = new EventEmitter<string>();

  visible = false;

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  updateValue(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.emitChange(this.value);
    this.valueChange.emit(this.value);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : shape === 'pill' ? 'rounded-full' : 'rounded-[var(--josanz-radius-control)]';
  }

  strengthScore(): number {
    const value = this.value;
    let score = 0;
    if (value.length >= 8) {
      score += 1;
    }
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      score += 1;
    }
    if (/\d/.test(value)) {
      score += 1;
    }
    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    }
    return score;
  }

  strengthSegments(): boolean[] {
    const score = this.strengthScore();
    return [1, 2, 3, 4].map((level) => score >= level);
  }

  strengthLabel(): string {
    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    return labels[this.strengthScore()] ?? labels[0];
  }

  strengthColor(): string {
    const score = this.strengthScore();
    if (score <= 1) {
      return 'var(--josanz-danger)';
    }
    if (score === 2) {
      return 'var(--josanz-warning, #d97706)';
    }
    return 'var(--josanz-success, var(--josanz-primary))';
  }
}
