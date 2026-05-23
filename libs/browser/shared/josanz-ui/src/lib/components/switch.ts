import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';

@Component({
  selector: 'josanz-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
  template: `
    <label
      class="inline-flex cursor-pointer items-center gap-3"
      [class.opacity-60]="disabled"
    >
      <button
        type="button"
        role="switch"
        class="relative h-7 w-12 shrink-0 border border-solid p-0 transition-colors disabled:cursor-not-allowed"
        [class.rounded-full]="true"
        [style.backgroundColor]="
          checked ? accentColor : 'var(--josanz-field-fill)'
        "
        [style.borderColor]="
          checked ? accentColor : 'var(--josanz-stroke-field)'
        "
        [attr.aria-checked]="checked"
        [attr.aria-label]="ariaLabel || label"
        [disabled]="disabled"
        (click)="toggle()"
      >
        <span
          class="absolute top-0.5 h-5.5 w-5.5 rounded-full shadow-sm transition-transform"
          [style.left]="'2px'"
          [style.width]="'22px'"
          [style.height]="'22px'"
          [style.transform]="checked ? 'translateX(20px)' : 'translateX(0)'"
          [style.backgroundColor]="'var(--josanz-surface)'"
          aria-hidden="true"
        ></span>
      </button>
      <span class="min-w-0">
        <span
          class="block text-sm font-black"
          [style.color]="'var(--josanz-text)'"
          >{{ label }}</span
        >
        @if (description) {
          <span
            class="mt-0.5 block text-xs"
            [style.color]="'var(--josanz-text-muted)'"
            >{{ description }}</span
          >
        }
      </span>
    </label>
  `,
})
export class SwitchComponent extends JosanzValueAccessorBase<boolean> {
  @Input() label = 'Switch';
  @Input() description = '';
  @Input() checked = false;
  @Input() override disabled = false;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  override writeValue(value: boolean | null): void {
    this.checked = !!value;
  }

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  toggle(): void {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.emitChange(this.checked);
    this.checkedChange.emit(this.checked);
    this.markTouched();
  }
}
