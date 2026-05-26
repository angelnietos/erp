import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'josanz-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="group relative inline-flex">
      <ng-content></ng-content>
      <span
        class="pointer-events-none absolute z-40 max-w-xs whitespace-nowrap rounded-xl border border-solid px-3 py-2 text-xs font-bold opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        [ngClass]="positionClass()"
        [style.backgroundColor]="'var(--josanz-surface)'"
        [style.borderColor]="'var(--josanz-border)'"
        [style.color]="'var(--josanz-text)'"
        role="tooltip"
      >
        {{ text }}
      </span>
    </span>
  `,
})
export class TooltipComponent {
  @Input() text = 'Tooltip';
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';

  positionClass(): string {
    if (this.position === 'right') {
      return 'left-full top-1/2 ml-2 -translate-y-1/2';
    }
    if (this.position === 'bottom') {
      return 'left-1/2 top-full mt-2 -translate-x-1/2';
    }
    if (this.position === 'left') {
      return 'right-full top-1/2 mr-2 -translate-y-1/2';
    }
    return 'bottom-full left-1/2 mb-2 -translate-x-1/2';
  }
}
