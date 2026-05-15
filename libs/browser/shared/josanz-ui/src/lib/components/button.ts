import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';
import { josanzCornerButton, type JosanzControlShape } from '../josanz-control-styles';

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
    const base =
      'inline-flex items-center justify-center gap-2 border-2 border-solid outline-none whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 transition-[box-shadow,transform] duration-200';
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-[14px] font-semibold',
      lg: 'h-12 px-8 text-base font-bold',
      xl: 'h-14 px-10 text-lg font-bold'
    };

    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;

    const corner = josanzCornerButton(activeShape);

    return [
      base,
      sizes[this.size] || sizes.md,
      corner,
      this.fullWidth ? 'w-full' : '',
      this.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
    ].filter(Boolean).join(' ');
  }

  borderWidth(): string {
    return this.variant === 'outline' || this.variant === 'secondary' ? '2px' : '0';
  }

  getBgColor() {
    const t = this.themeService.currentTheme();
    if (this.variant === 'primary') {
      return this.customColor ?? 'var(--josanz-primary)';
    }
    if (this.variant === 'secondary') {
      return t.atmosphere.surface;
    }
    if (this.variant === 'danger') {
      return 'var(--josanz-danger)';
    }
    if (this.variant === 'ghost') {
      return 'transparent';
    }
    return 'transparent';
  }

  getBorderColor() {
    const t = this.themeService.currentTheme();
    if (this.variant === 'outline') {
      return this.customColor ?? 'var(--josanz-primary)';
    }
    if (this.variant === 'secondary') {
      return t.atmosphere.border;
    }
    return 'transparent';
  }

  getTextColor() {
    const t = this.themeService.currentTheme();
    if (this.variant === 'primary') {
      return this.customColor
        ? josanzReadableOnSolid(this.customColor)
        : 'var(--josanz-on-primary)';
    }
    if (this.variant === 'danger') {
      return 'var(--josanz-on-danger)';
    }
    if (this.variant === 'outline' || this.variant === 'ghost') {
      return this.customColor ?? 'var(--josanz-primary)';
    }
    return t.atmosphere.text;
  }

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
