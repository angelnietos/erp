import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export type JosanzProgressTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'custom';

@Component({
  selector: 'josanz-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="grid w-full gap-2"
      role="progressbar"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max"
      [attr.aria-valuenow]="safeValue()"
    >
      @if (label || showValue) {
        <div
          class="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wider"
        >
          <span [style.color]="'var(--josanz-text-muted)'">{{ label }}</span>
          @if (showValue) {
            <span [style.color]="'var(--josanz-text)'"
              >{{ percentage() }}%</span
            >
          }
        </div>
      }
      <div
        class="h-2.5 w-full overflow-hidden"
        [ngClass]="cornerClass()"
        [style.backgroundColor]="
          'color-mix(in srgb, var(--josanz-text-muted) 12%, var(--josanz-surface))'
        "
      >
        <div
          class="h-full transition-[width]"
          [ngClass]="cornerClass()"
          [style.width.%]="percentage()"
          [style.background]="barBackground()"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() label = '';
  @Input() value = 40;
  @Input() max = 100;
  @Input() tone: JosanzProgressTone = 'primary';
  @Input() showValue = true;
  @Input() striped = false;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  safeValue(): number {
    return Math.max(0, Math.min(this.max || 100, this.value));
  }

  percentage(): number {
    return Math.round((this.safeValue() / (this.max || 100)) * 100);
  }

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    return shape === 'square' ? 'rounded-none' : 'rounded-full';
  }

  barBackground(): string {
    const color = this.color();
    if (!this.striped) {
      return color;
    }
    return `repeating-linear-gradient(45deg, ${color}, ${color} 10px, color-mix(in srgb, ${color} 75%, white) 10px, color-mix(in srgb, ${color} 75%, white) 20px)`;
  }

  private color(): string {
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
    return 'var(--josanz-primary)';
  }
}
