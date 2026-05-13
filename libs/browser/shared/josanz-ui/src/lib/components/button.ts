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
      [style.backgroundColor]="variant === 'primary' && customColor ? customColor : null"
      [style.borderColor]="(variant === 'outline' || variant === 'secondary') && customColor ? customColor : null"
      [style.color]="(variant === 'outline' || variant === 'ghost') && customColor ? customColor : null"
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
    const base = 'inline-flex items-center justify-center gap-2 transition-all duration-200 outline-none whitespace-nowrap';
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-[14px]',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg'
    };

    const shapes = {
      rounded: 'rounded-[8px]',
      pill: 'rounded-full',
      square: 'rounded-sm'
    };

    const variants = {
      primary: 'bg-black text-white hover:brightness-110 shadow-md',
      secondary: 'bg-slate-100 text-slate-900 border border-transparent hover:brightness-95',
      outline: 'bg-transparent text-black border border-black hover:opacity-70',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      danger: 'bg-red-500 text-white hover:brightness-110 shadow-md shadow-red-500/30'
    };

    return [
      base,
      sizes[this.size] || sizes.md,
      shapes[this.shape] || shapes.rounded,
      variants[this.variant] || variants.primary,
      this.fullWidth ? 'w-full' : '',
      this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
    ].filter(Boolean).join(' ');
  }

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
