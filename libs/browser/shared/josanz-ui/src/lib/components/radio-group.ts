import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface JosanzRadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'josanz-radio-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <fieldset
      class="m-0 grid gap-3 border-0 p-0"
      [attr.aria-label]="ariaLabel || label"
    >
      @if (label) {
        <legend
          class="mb-1 text-[11px] font-bold uppercase tracking-[0.1em]"
          [style.color]="'var(--josanz-label-muted)'"
        >
          {{ label }}
        </legend>
      }
      <div
        class="grid gap-2"
        [ngClass]="
          orientation === 'horizontal' ? 'sm:grid-flow-col sm:auto-cols-fr' : ''
        "
      >
        @for (option of options; track option.value) {
          <label
            class="flex cursor-pointer items-start gap-3 rounded-2xl border border-solid p-3"
            [class.opacity-60]="option.disabled"
            [style.backgroundColor]="'var(--josanz-surface)'"
            [style.borderColor]="
              option.value === value ? accentColor : 'var(--josanz-border)'
            "
          >
            <span
              class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-solid"
              [style.borderColor]="
                option.value === value
                  ? accentColor
                  : 'var(--josanz-stroke-field)'
              "
            >
              <input
                class="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                type="radio"
                [name]="name"
                [value]="option.value"
                [checked]="option.value === value"
                [disabled]="option.disabled"
                (change)="select(option)"
              />
              @if (option.value === value) {
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  [style.backgroundColor]="accentColor"
                  aria-hidden="true"
                ></span>
              }
            </span>
            <span class="min-w-0">
              <span
                class="block text-sm font-black"
                [style.color]="'var(--josanz-text)'"
                >{{ option.label }}</span
              >
              @if (option.description) {
                <span
                  class="mt-0.5 block text-xs"
                  [style.color]="'var(--josanz-text-muted)'"
                  >{{ option.description }}</span
                >
              }
            </span>
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class RadioGroupComponent {
  @Input() label = '';
  @Input() options: JosanzRadioOption[] = [];
  @Input() value = '';
  @Input() name = `josanz-radio-${Math.random().toString(36).slice(2)}`;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() optionSelect = new EventEmitter<JosanzRadioOption>();

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  select(option: JosanzRadioOption): void {
    if (option.disabled) {
      return;
    }
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.optionSelect.emit(option);
  }
}
