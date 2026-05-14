import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

@Component({
  selector: 'josanz-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onClick()"
      [disabled]="disabled"
      [class]="buttonClasses"
      [style.backgroundColor]="getBgColor()"
      [style.borderColor]="getBorderColor()"
      [style.color]="getTextColor()"
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
  public themeService = inject(JosanzThemeService);

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
    const base = 'inline-flex items-center justify-center gap-2 transition-all duration-200 outline-none whitespace-nowrap shadow-sm hover:shadow-md active:scale-95';
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-[14px] font-semibold',
      lg: 'h-12 px-8 text-base font-bold',
      xl: 'h-14 px-10 text-lg font-bold'
    };

    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;

    const shapes = {
      rounded: 'rounded-[10px]',
      pill: 'rounded-full',
      square: 'rounded-none',
      modal: 'rounded-[24px]',
      inner: 'rounded-[6px]',
      avatar: 'rounded-[10px]',
      field: 'rounded-[10px]'
    };

    return [
      base,
      sizes[this.size] || sizes.md,
      shapes[activeShape as keyof typeof shapes] || shapes.rounded,
      this.fullWidth ? 'w-full' : '',
      this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
    ].filter(Boolean).join(' ');
  }

  getBgColor() {
    if (this.customColor) return this.customColor;
    if (this.variant === 'primary') return this.themeService.currentTheme().primaryColor;
    if (this.variant === 'secondary') return '#F1F5F9'; // slate-100
    if (this.variant === 'danger') return '#EF4444';
    return 'transparent';
  }

  getBorderColor() {
    if (this.variant === 'outline') return this.customColor || this.themeService.currentTheme().primaryColor;
    if (this.variant === 'secondary') return 'transparent';
    return 'transparent';
  }

  getTextColor() {
    if (this.variant === 'primary' || this.variant === 'danger') return 'white';
    if (this.variant === 'outline' || this.variant === 'ghost') return this.customColor || this.themeService.currentTheme().primaryColor;
    return '#1e293b'; // slate-800
  }

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
