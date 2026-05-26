import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BadgeComponent } from './badge';
import { JosanzValueAccessorBase } from '../forms/josanz-value-accessor.base';
import type { JosanzSelectOption } from './select';

@Component({
  selector: 'josanz-multi-select',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <section
      class="relative grid w-full gap-2"
      [attr.aria-label]="ariaLabel || label"
    >
      @if (label) {
        <span
          class="ml-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
          >{{ label }}</span
        >
      }
      <button
        type="button"
        class="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-[var(--josanz-radius-control)] border border-solid px-3 py-2 text-left"
        [style.backgroundColor]="'var(--josanz-field-fill)'"
        [style.borderColor]="open ? accentColor : 'var(--josanz-stroke-field)'"
        [disabled]="disabled"
        (click)="togglePanel()"
      >
        @if (selectedOptions().length) {
          @for (option of selectedOptions(); track option.value) {
            <josanz-badge
              [label]="option.label"
              tone="custom"
              [customColor]="accentColor"
              [removable]="true"
              (remove)="toggleValue(option.value)"
            ></josanz-badge>
          }
        } @else {
          <span class="text-sm" [style.color]="'var(--josanz-text-muted)'">{{
            placeholder
          }}</span>
        }
      </button>
      @if (open) {
        <div
          class="absolute left-0 right-0 top-full z-30 mt-2 grid max-h-64 gap-1 overflow-auto rounded-2xl border border-solid p-2 shadow-xl"
          [style.backgroundColor]="'var(--josanz-surface)'"
          [style.borderColor]="'var(--josanz-border)'"
        >
          @for (option of options; track option.value) {
            <label
              class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/[0.03]"
            >
              <input
                type="checkbox"
                [checked]="values.includes(option.value)"
                [disabled]="option.disabled || disabled"
                (change)="toggleValue(option.value)"
              />
              <span
                class="text-sm font-bold"
                [style.color]="'var(--josanz-text)'"
                >{{ option.label }}</span
              >
            </label>
          }
        </div>
      }
    </section>
  `,
})
export class MultiSelectComponent extends JosanzValueAccessorBase<string[]> {
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() options: JosanzSelectOption[] = [];
  @Input() values: string[] = [];
  @Input() override disabled = false;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valuesChange = new EventEmitter<string[]>();

  open = false;

  override writeValue(value: string[] | null): void {
    this.values = Array.isArray(value) ? value : [];
  }

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  selectedOptions(): JosanzSelectOption[] {
    return this.options.filter((option) => this.values.includes(option.value));
  }

  togglePanel(): void {
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    if (!this.open) {
      this.markTouched();
    }
  }

  toggleValue(value: string): void {
    if (this.disabled) {
      return;
    }
    this.values = this.values.includes(value)
      ? this.values.filter((item) => item !== value)
      : [...this.values, value];
    this.emitChange(this.values);
    this.valuesChange.emit(this.values);
  }
}
