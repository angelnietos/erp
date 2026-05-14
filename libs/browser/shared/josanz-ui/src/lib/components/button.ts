import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { JosanzControlShape } from '../josanz-control-styles';

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
  private themeService = inject(JosanzThemeService);

  @Input() label = 'Añadir';
  @Input() showIcon = true;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() fullWidth = false;
  @Output() btnClick = new EventEmitter<void>();

  get buttonClasses() {
    const base = 'inline-flex items-center justify-center gap-2 transition-transform transition-opacity transition-shadow duration-200 outline-none whitespace-nowrap';
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-[14px]',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg'
    };

    // Usar la shape del input o la del tema global
    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;

    const shapes = {
      rounded: 'rounded-[8px]',
      pill: 'rounded-full',
      square: 'rounded-none',
      modal: 'rounded-[24px]',
      inner: 'rounded-[6px]',
      avatar: 'rounded-[10px]',
      field: 'rounded-[8px]'
    };

    const variants = {
      primary: 'bg-black text-white hover:opacity-80 shadow-md',
      secondary: 'bg-slate-100 text-slate-900 border border-transparent hover:opacity-80',
      outline: 'bg-transparent text-black border border-black hover:opacity-70',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      danger: 'bg-red-500 text-white hover:opacity-80 shadow-md shadow-red-500/30'
    };

    return [
      base,
      sizes[this.size] || sizes.md,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded,
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
