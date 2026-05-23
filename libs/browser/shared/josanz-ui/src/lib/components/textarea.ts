import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <label class="grid w-full gap-2">
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
        >
          {{ label }}
        </span>
      }
      <textarea
        class="min-h-[112px] w-full resize-y border border-solid px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-[color:var(--josanz-text-muted)]"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="borderColor()"
        [style.boxShadow]="focusRing()"
        [style.color]="'var(--josanz-text)'"
        [placeholder]="placeholder"
        [value]="value"
        [rows]="rows"
        [attr.maxlength]="maxLength ?? null"
        [disabled]="disabled"
        [attr.aria-describedby]="hint || error ? hintId : null"
        (focus)="isFocused = true"
        (blur)="onBlur()"
        (input)="updateValue($event)"
      ></textarea>
      @if (hint || error || maxLength) {
        <span class="flex justify-between gap-3 text-xs" [id]="hintId">
          <span
            [style.color]="
              error ? 'var(--josanz-danger)' : 'var(--josanz-text-muted)'
            "
            >{{ error || hint }}</span
          >
          @if (maxLength) {
            <span [style.color]="'var(--josanz-text-muted)'"
              >{{ value.length }}/{{ maxLength }}</span
            >
          }
        </span>
      }
    </label>
  `,
})
export class TextareaComponent extends JosanzValueAccessorBase<string> {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() rows = 4;
  @Input() maxLength?: number;
  @Input() hint = '';
  @Input() error = '';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  @Output() valueChange = new EventEmitter<string>();

  readonly hintId = `josanz-textarea-${Math.random().toString(36).slice(2)}`;
  isFocused = false;

  override writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  updateValue(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value = next;
    this.emitChange(next);
    this.valueChange.emit(next);
  }

  onBlur(): void {
    this.isFocused = false;
    this.markTouched();
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[28px]';
    }
    return 'rounded-[var(--josanz-radius-control)]';
  }

  borderColor(): string {
    if (this.error) {
      return 'var(--josanz-danger)';
    }
    return this.isFocused || this.customColor
      ? this.accentColor()
      : 'var(--josanz-stroke-field)';
  }

  focusRing(): string {
    if (!this.isFocused) {
      return 'none';
    }
    const color = this.accentColor();
    return `0 0 0 2px color-mix(in srgb, ${color} 35%, transparent)`;
  }

  private accentColor(): string {
    return this.customColor || 'var(--josanz-interactive)';
  }
}
