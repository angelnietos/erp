import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type JosanzSpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'josanz-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-3"
      role="status"
      [attr.aria-label]="ariaLabel || label || 'Cargando'"
    >
      <span
        class="inline-block animate-spin rounded-full border-2 border-solid"
        [ngClass]="sizeClass()"
        [style.borderColor]="
          'color-mix(in srgb, ' + accentColor + ' 20%, var(--josanz-border))'
        "
        [style.borderTopColor]="accentColor"
        aria-hidden="true"
      ></span>
      @if (label) {
        <span
          class="text-sm font-bold"
          [style.color]="'var(--josanz-text-muted)'"
          >{{ label }}</span
        >
      }
      <span class="sr-only">{{ srText }}</span>
    </span>
  `,
})
export class SpinnerComponent {
  @Input() label = '';
  @Input() size: JosanzSpinnerSize = 'md';
  @Input() customColor?: string;
  @Input() ariaLabel = '';
  @Input() srText = 'Cargando';

  get accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }

  sizeClass(): string {
    if (this.size === 'sm') {
      return 'h-4 w-4';
    }
    if (this.size === 'lg') {
      return 'h-9 w-9';
    }
    return 'h-6 w-6';
  }
}
