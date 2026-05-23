import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="flex w-full flex-col border border-solid"
      [ngClass]="cornerClass()"
      [ngStyle]="shellStyles()"
      [attr.aria-label]="ariaLabel || title || 'Tarjeta'"
    >
      @if (title || subtitle || headerActionLabel) {
        <header class="flex items-start justify-between gap-4 border-b border-solid p-5" [style.borderColor]="'var(--josanz-border)'">
          <div class="min-w-0">
            @if (eyebrow) {
              <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" [style.color]="'var(--josanz-text-muted)'">{{ eyebrow }}</p>
            }
            @if (title) {
              <h2 class="m-0 text-lg font-black" [style.color]="'var(--josanz-text)'">{{ title }}</h2>
            }
            @if (subtitle) {
              <p class="m-0 mt-1 text-sm" [style.color]="'var(--josanz-text-muted)'">{{ subtitle }}</p>
            }
          </div>
          @if (headerActionLabel) {
            <button type="button" class="shrink-0 rounded-full border border-solid bg-transparent px-3 py-1 text-xs font-black" [style.borderColor]="'var(--josanz-border)'" [style.color]="accentColor()">
              {{ headerActionLabel }}
            </button>
          }
        </header>
      }
      <div class="min-h-0 flex-1 p-5">
        <ng-content></ng-content>
      </div>
      @if (footerLabel) {
        <footer class="border-t border-solid p-5 text-sm font-bold" [style.borderColor]="'var(--josanz-border)'" [style.color]="'var(--josanz-text-muted)'">
          {{ footerLabel }}
        </footer>
      }
    </article>
  `,
})
export class CardComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() footerLabel = '';
  @Input() headerActionLabel = '';
  @Input() elevated = true;
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() ariaLabel = '';

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[32px]';
    }
    return 'rounded-3xl';
  }

  shellStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: this.elevated ? atmosphere.shadow : 'none',
    };
  }

  accentColor(): string {
    return this.customColor || 'var(--josanz-primary)';
  }
}
