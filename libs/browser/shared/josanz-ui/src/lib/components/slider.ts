import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="grid w-full gap-2">
      @if (label || showValue) {
        <span class="flex items-center justify-between gap-3">
          <span
            class="text-[11px] font-bold uppercase tracking-[0.1em]"
            [style.color]="'var(--josanz-label-muted)'"
            >{{ label }}</span
          >
          @if (showValue) {
            <span
              class="rounded-full px-2 py-1 text-[10px] font-black"
              [style.backgroundColor]="
                'color-mix(in srgb, ' +
                accentColor +
                ' 12%, var(--josanz-surface))'
              "
              [style.color]="accentColor"
            >
              {{ value }}{{ suffix }}
            </span>
          }
        </span>
      }
      <input
        class="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
        type="range"
        [min]="min"
        [max]="max"
        [step]="step"
        [value]="value"
        [disabled]="disabled"
        [style.background]="trackBackground()"
        [attr.aria-label]="ariaLabel || label"
        (input)="updateValue($event)"
      />
      @if (hint) {
        <span class="text-xs" [style.color]="'var(--josanz-text-muted)'">{{
          hint
        }}</span>
      }
    </label>
  `,
  styles: [
    `
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: var(--josanz-primary);
        border: 3px solid var(--josanz-surface);
        box-shadow: 0 6px 16px rgba(15, 30, 47, 0.22);
      }
      input[type='range']::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: var(--josanz-primary);
        border: 3px solid var(--josanz-surface);
        box-shadow: 0 6px 16px rgba(15, 30, 47, 0.22);
      }
    `,
  ],
})
export class SliderComponent {
  @Input() label = 'Slider';
  @Input() value = 50;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() suffix = '';
  @Input() hint = '';
  @Input() showValue = true;
  @Input() disabled = false;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<number>();

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  updateValue(event: Event): void {
    this.value = Number((event.target as HTMLInputElement).value);
    this.valueChange.emit(this.value);
  }

  trackBackground(): string {
    const range = this.max - this.min || 1;
    const percentage = ((this.value - this.min) / range) * 100;
    return `linear-gradient(90deg, ${this.accentColor} 0%, ${this.accentColor} ${percentage}%, color-mix(in srgb, var(--josanz-text-muted) 14%, var(--josanz-surface)) ${percentage}%)`;
  }
}
