import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export type JosanzBadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'custom';
export type JosanzBadgeVariant = 'soft' | 'solid' | 'outline';
export type JosanzBadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'josanz-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex min-w-0 items-center gap-1.5 border border-solid font-black uppercase tracking-wider"
      [ngClass]="badgeClasses()"
      [ngStyle]="badgeStyles()"
      [attr.role]="role || null"
      [attr.aria-label]="ariaLabel || label"
    >
      @if (dot) {
        <span
          class="h-1.5 w-1.5 shrink-0 rounded-full"
          [style.backgroundColor]="accentColor()"
          aria-hidden="true"
        ></span>
      }
      <span class="truncate">{{ label }}</span>
      @if (removable) {
        <button
          type="button"
          class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 hover:opacity-100"
          aria-label="Quitar etiqueta"
          (click)="remove.emit()"
        >
          ×
        </button>
      }
    </span>
  `,
})
export class BadgeComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = 'Badge';
  @Input() tone: JosanzBadgeTone = 'primary';
  @Input() variant: JosanzBadgeVariant = 'soft';
  @Input() size: JosanzBadgeSize = 'md';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() dot = false;
  @Input() removable = false;
  @Input() role = '';
  @Input() ariaLabel = '';

  @Output() remove = new EventEmitter<void>();

  badgeClasses(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    const sizeClass =
      this.size === 'sm'
        ? 'px-2 py-0.5 text-[9px]'
        : this.size === 'lg'
          ? 'px-3.5 py-1.5 text-xs'
          : 'px-2.5 py-1 text-[10px]';
    const shapeClass = shape === 'square' ? 'rounded-none' : 'rounded-full';
    return `${sizeClass} ${shapeClass}`;
  }

  badgeStyles(): Record<string, string> {
    const color = this.accentColor();
    if (this.variant === 'solid') {
      return {
        backgroundColor: color,
        borderColor: color,
        color: 'var(--josanz-surface)',
      };
    }
    if (this.variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: `color-mix(in srgb, ${color} 55%, var(--josanz-border))`,
        color,
      };
    }
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      borderColor: `color-mix(in srgb, ${color} 24%, var(--josanz-border))`,
      color,
    };
  }

  accentColor(): string {
    if (this.customColor) {
      return this.customColor;
    }
    if (this.tone === 'success') {
      return 'var(--josanz-success)';
    }
    if (this.tone === 'warning') {
      return 'var(--josanz-warning)';
    }
    if (this.tone === 'danger') {
      return 'var(--josanz-danger)';
    }
    if (this.tone === 'neutral') {
      return 'var(--josanz-text-muted)';
    }
    return 'var(--josanz-primary)';
  }
}
