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
      type="button"
      (click)="onClick()"
      [disabled]="disabled"
      [attr.data-variant]="variant"
      [class]="buttonClasses"
      [style.backgroundColor]="getBgColor()"
      [style.borderColor]="getBorderColor()"
      [style.boxShadow]="buttonShadow()"
      [ngStyle]="labelStyle()"
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
  styles: [
    `
      :host button {
        font-family: inherit;
      }

      :host button[data-variant='primary']:not(:disabled):hover {
        background-color: var(--josanz-button-primary-hover-bg) !important;
      }

      :host button[data-variant='secondary']:not(:disabled):hover,
      :host button[data-variant='outline']:not(:disabled):hover {
        background-color: var(--josanz-button-secondary-bg) !important;
        box-shadow: 0 0 0 2px var(--josanz-focus-ring) !important;
      }

      :host button[data-variant='ghost']:not(:disabled):hover {
        background-color: transparent !important;
        box-shadow: none !important;
      }
    `,
  ],
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
      'inline-flex items-center justify-center gap-2 border border-solid outline-none whitespace-nowrap active:scale-[0.98] transition-[background-color,border-color,box-shadow,transform,filter] duration-150';
    
    const sizes = {
      sm: 'h-[25px] px-[10px] text-[11px] font-semibold',
      md: 'h-[36px] px-[16px] text-[14px] font-semibold',
      lg: 'h-[44px] px-[28px] text-base font-bold',
      xl: 'h-[48px] px-[32px] text-lg font-bold'
    };

    const activeShape = this.shape || this.themeService.currentTheme().defaultShape;

    const corner = josanzCornerButton(activeShape);

    return [
      base,
      sizes[this.size] || sizes.md,
      corner,
      this.fullWidth ? 'w-full' : '',
      this.disabled ? 'cursor-not-allowed pointer-events-none' : ''
    ].filter(Boolean).join(' ');
  }

  borderWidth(): string {
    return this.variant === 'outline' || this.variant === 'secondary' ? '2px' : '0';
  }

  getBgColor() {
    if (this.variant === 'primary') {
      if (this.disabled) {
        return 'var(--josanz-button-disabled-bg)';
      }
      return this.customColor ?? 'var(--josanz-button-primary-bg)';
    }
    if (this.variant === 'secondary') {
      return this.disabled ? 'var(--josanz-button-disabled-bg)' : 'var(--josanz-button-secondary-bg)';
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
    if (this.variant === 'outline') {
      return this.disabled ? 'var(--josanz-button-disabled-border)' : (this.customColor ?? 'var(--josanz-button-secondary-border)');
    }
    if (this.variant === 'secondary') {
      return this.disabled ? 'var(--josanz-button-disabled-border)' : 'var(--josanz-button-secondary-border)';
    }
    return 'transparent';
  }

  /** Color vía `ngStyle` + token `--josanz-on-primary` (misma fuente que el tema). */
  labelStyle(): Record<string, string> {
    if (this.disabled) {
      const c = 'var(--josanz-button-disabled-text)';
      return { color: c, WebkitTextFillColor: c };
    }
    if (this.variant === 'primary') {
      const color = this.customColor
        ? josanzReadableOnSolid(this.customColor)
        : 'var(--josanz-button-primary-text)';
      return { color, WebkitTextFillColor: color };
    }
    if (this.variant === 'danger') {
      const c = 'var(--josanz-on-danger)';
      return { color: c, WebkitTextFillColor: c };
    }
    if (this.variant === 'outline' || this.variant === 'ghost') {
      return { color: this.customColor ?? 'var(--josanz-button-secondary-text)' };
    }
    return { color: this.customColor ?? 'var(--josanz-button-secondary-text, var(--josanz-text))' };
  }

  buttonShadow(): string {
    if (this.disabled || this.variant === 'ghost' || this.variant === 'outline') {
      return 'none';
    }
    if (this.variant === 'primary') {
      return 'var(--josanz-button-shadow)';
    }
    return '0 2px 8px rgba(231, 237, 241, 0.9)';
  }

  onClick() {
    if (!this.disabled) {
      this.btnClick.emit();
    }
  }
}
