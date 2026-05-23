import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="inline-flex items-center gap-2"
      [attr.aria-label]="ariaLabel || label"
    >
      @if (label) {
        <span class="text-sm font-bold" [style.color]="'var(--josanz-text)'">{{
          label
        }}</span>
      }
      <span class="inline-flex gap-1" role="radiogroup">
        @for (star of stars(); track star) {
          <button
            type="button"
            class="border-0 bg-transparent p-0 text-2xl leading-none"
            [style.color]="
              star <= value ? accentColor() : 'var(--josanz-border)'
            "
            [disabled]="readonly"
            [attr.aria-label]="'Valorar ' + star"
            [attr.aria-checked]="star === value"
            role="radio"
            (click)="setValue(star)"
          >
            ★
          </button>
        }
      </span>
      @if (showValue) {
        <span
          class="text-sm font-black"
          [style.color]="'var(--josanz-text-muted)'"
          >{{ value }}/{{ max }}</span
        >
      }
    </div>
  `,
})
export class RatingComponent {
  @Input() label = '';
  @Input() value = 4;
  @Input() max = 5;
  @Input() readonly = false;
  @Input() showValue = true;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<number>();

  stars(): number[] {
    return Array.from(
      { length: Math.max(1, this.max) },
      (_, index) => index + 1,
    );
  }

  setValue(value: number): void {
    if (this.readonly) {
      return;
    }
    this.value = value;
    this.valueChange.emit(value);
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-warning)';
  }
}
