import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'josanz-floating-action-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="inline-flex items-center justify-center gap-2 rounded-full border-0 px-5 py-4 font-black text-white shadow-xl transition-transform hover:-translate-y-0.5 active:translate-y-0"
      [class.h-14]="!label"
      [class.w-14]="!label"
      [style.backgroundColor]="customColor || 'var(--josanz-primary)'"
      [attr.aria-label]="ariaLabel || label || 'Acción principal'"
      (click)="fabClick.emit()"
    >
      <span class="text-2xl leading-none" aria-hidden="true">{{ icon }}</span>
      @if (label) {
        <span class="text-sm">{{ label }}</span>
      }
    </button>
  `,
})
export class FloatingActionButtonComponent {
  @Input() icon = '+';
  @Input() label = '';
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  @Output() fabClick = new EventEmitter<void>();
}
