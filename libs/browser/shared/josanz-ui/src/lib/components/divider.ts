import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'josanz-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center gap-3"
      [ngClass]="orientation === 'vertical' ? 'h-full flex-col' : 'w-full'"
      role="separator"
      [attr.aria-orientation]="orientation"
    >
      <span
        class="block"
        [ngClass]="lineClass()"
        [style.backgroundColor]="color || 'var(--josanz-border)'"
      ></span>
      @if (label) {
        <span
          class="shrink-0 text-[10px] font-black uppercase tracking-[0.18em]"
          [style.color]="'var(--josanz-text-muted)'"
          >{{ label }}</span
        >
        <span
          class="block"
          [ngClass]="lineClass()"
          [style.backgroundColor]="color || 'var(--josanz-border)'"
        ></span>
      }
    </div>
  `,
})
export class DividerComponent {
  @Input() label = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() color = '';

  lineClass(): string {
    return this.orientation === 'vertical'
      ? 'h-full min-h-8 w-px'
      : 'h-px flex-1';
  }
}
