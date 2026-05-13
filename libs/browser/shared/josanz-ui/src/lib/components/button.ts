import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'josanz-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onClick()"
      [disabled]="disabled"
      [class]="buttonClasses"
      [style.--btn-color]="customColor"
    >
      <span>{{ label }}</span>
      @if (showIcon) {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      }
    </button>
  `,
})
export class ButtonComponent {
  @Input() label = 'Añadir';
  @Input() showIcon = true;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() shape: 'rounded' | 'pill' | 'square' = 'rounded';
  @Input() customColor?: string;
  @Input() fullWidth = false;
  @Output() btnClick = new EventEmitter<void>();

  get buttonClasses() {
    return [
      'btn',
      `btn--${this.size}`,
      `btn--${this.variant}`,
      `btn--shape-${this.shape}`,
      this.fullWidth ? 'btn--full' : ''
    ].filter(Boolean).join(' ');
  }

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
