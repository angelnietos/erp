import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import type { JosanzControlShape } from '../josanz-control-styles';
import { JosanzThemeService } from '../services/theme.service';

export type JosanzStatTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'custom';
export type JosanzStatIcon = 'users' | 'calendar' | 'invoice' | 'truck' | 'trend' | 'document';
export type JosanzTrendDirection = 'up' | 'down' | 'flat';

@Component({
  selector: 'josanz-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="flex min-w-0 flex-col border border-solid p-5"
      [ngClass]="cornerClass()"
      [ngStyle]="cardStyles()"
      [attr.aria-label]="ariaLabel || title"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          @if (eyebrow) {
            <p class="m-0 text-[10px] font-black uppercase tracking-[0.18em]" [style.color]="'var(--josanz-text-muted)'">
              {{ eyebrow }}
            </p>
          }
          <h3 class="m-0 mt-1 truncate text-sm font-black" [style.color]="'var(--josanz-text)'">
            {{ title }}
          </h3>
        </div>
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-solid"
          [ngStyle]="iconStyles()"
          aria-hidden="true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            @switch (icon) {
              @case ('calendar') {
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              }
              @case ('invoice') {
                <path d="M4 2h14l2 2v18l-4-2-4 2-4-2-4 2Z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              }
              @case ('truck') {
                <path d="M10 17h4V5H2v12h3" />
                <path d="M14 8h4l4 4v5h-3" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="16.5" cy="17.5" r="2.5" />
              }
              @case ('trend') {
                <path d="m3 17 6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              }
              @case ('document') {
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
              }
              @default {
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              }
            }
          </svg>
        </div>
      </div>

      <div class="mt-6 flex items-end justify-between gap-4">
        <div class="min-w-0">
          <p class="m-0 truncate text-3xl font-black tracking-tight" [style.color]="'var(--josanz-text)'">
            {{ value }}
          </p>
          @if (caption) {
            <p class="m-0 mt-1 truncate text-xs font-semibold" [style.color]="'var(--josanz-text-muted)'">
              {{ caption }}
            </p>
          }
        </div>

        @if (trendLabel) {
          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
            [ngStyle]="trendStyles()"
          >
            {{ trendPrefix() }} {{ trendLabel }}
          </span>
        }
      </div>
    </article>
  `,
})
export class StatCardComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() eyebrow = '';
  @Input() title = 'Indicador';
  @Input() value = '0';
  @Input() caption = '';
  @Input() trendLabel = '';
  @Input() trendDirection: JosanzTrendDirection = 'flat';
  @Input() tone: JosanzStatTone = 'primary';
  @Input() icon: JosanzStatIcon = 'trend';
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

  cardStyles(): Record<string, string> {
    const atmosphere = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: atmosphere.surface,
      borderColor: atmosphere.border,
      boxShadow: atmosphere.shadow,
    };
  }

  iconStyles(): Record<string, string> {
    const color = this.accentColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 12%, var(--josanz-surface))`,
      borderColor: `color-mix(in srgb, ${color} 24%, var(--josanz-border))`,
      color,
    };
  }

  trendStyles(): Record<string, string> {
    const color = this.trendDirection === 'down' ? 'var(--josanz-danger)' : this.accentColor();
    return {
      backgroundColor: `color-mix(in srgb, ${color} 14%, var(--josanz-surface))`,
      color,
    };
  }

  trendPrefix(): string {
    if (this.trendDirection === 'up') {
      return '+';
    }
    if (this.trendDirection === 'down') {
      return '-';
    }
    return '';
  }

  private accentColor(): string {
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
