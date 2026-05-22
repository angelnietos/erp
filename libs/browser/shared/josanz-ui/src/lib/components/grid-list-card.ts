import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzGridCardDensity } from '../list-view/list-view-preferences';
import type { JosanzStatusPillVariant } from './main-template-card';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';

@Component({
  selector: 'josanz-grid-list-card',
  standalone: true,
  imports: [CommonModule],
  host: {
    '[class.josanz-grid-list-card-host--compact]': "density === 'compact'",
    '[class.josanz-grid-list-card-host--dense]': "density === 'dense'",
  },
  template: `
    <article
      class="josanz-grid-list-card flex h-full min-h-0 w-full flex-col border border-solid text-left transition-all duration-200 hover:brightness-[0.98] active:scale-[0.99]"
      [ngClass]="[cornerClass(), paddingClass(), titleSizeClass()]"
      [ngStyle]="cardStyles()"
    >
      <header class="flex min-w-0 items-start justify-between gap-2" [ngClass]="headerSpacingClass()">
        <h3
          class="m-0 truncate font-extrabold leading-tight tracking-tight"
          [style.color]="'var(--josanz-text)'"
        >
          {{ title }}
        </h3>
        @if (status) {
          <span
            class="shrink-0 font-black uppercase tracking-wider"
            [ngClass]="[pillCornerClass(), badgeSizeClass()]"
            [ngStyle]="badgeStyles()"
          >
            {{ status }}
          </span>
        }
      </header>

      @if (previewLines.length > 0) {
        <div class="flex min-h-0 flex-1 flex-col justify-center overflow-hidden" [ngClass]="bodyGapClass()">
          @for (line of previewLines; track $index) {
            <div class="min-w-0">
              @if (fieldLabels[$index]) {
                <span
                  class="mb-0.5 block truncate font-bold uppercase tracking-wider"
                  [ngClass]="labelSizeClass()"
                  [style.color]="'var(--josanz-text-muted)'"
                >
                  {{ fieldLabels[$index] }}
                </span>
              }
              <span
                class="block truncate font-semibold leading-snug"
                [ngClass]="valueSizeClass()"
                [style.color]="'var(--josanz-text)'"
              >
                {{ line }}
              </span>
            </div>
          }
        </div>
      }
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        aspect-ratio: 1;
      }

      :host(.josanz-grid-list-card-host--dense) {
        aspect-ratio: 1 / 0.92;
      }

      .josanz-grid-list-card {
        box-shadow: var(--josanz-card-shadow, 0 1px 3px rgba(0, 0, 0, 0.06));
      }
    `,
  ],
})
export class GridListCardComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() status = '';
  @Input() statusVariant: JosanzStatusPillVariant = 'borrador';
  @Input() density: JosanzGridCardDensity = 'comfortable';
  @Input() previewLines: string[] = [];
  @Input() fieldLabels: string[] = [];
  /** Override del shape; si no se pasa, usa el shape global del tema. */
  @Input() shape?: JosanzControlShape;
  /** Override del color semantico de la pastilla de estado. */
  @Input() customColor?: string;

  cornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return this.density === 'dense' ? 'rounded-[20px]' : 'rounded-[28px]';
    }
    if (this.density === 'dense') {
      return 'rounded-xl';
    }
    if (this.density === 'compact') {
      return 'rounded-xl';
    }
    return 'rounded-2xl';
  }

  paddingClass(): string {
    if (this.density === 'dense') {
      return 'p-2';
    }
    if (this.density === 'compact') {
      return 'p-3';
    }
    return 'p-4';
  }

  titleSizeClass(): string {
    if (this.density === 'dense') {
      return 'text-[12px]';
    }
    if (this.density === 'compact') {
      return 'text-[13px]';
    }
    return 'text-[15px]';
  }

  headerSpacingClass(): string {
    if (this.density === 'dense') {
      return 'mb-0';
    }
    if (this.density === 'compact') {
      return 'mb-2';
    }
    return 'mb-3';
  }

  bodyGapClass(): string {
    return this.density === 'compact' ? 'gap-1.5' : 'gap-2';
  }

  labelSizeClass(): string {
    if (this.density === 'dense') {
      return 'text-[8px]';
    }
    return 'text-[9px]';
  }

  valueSizeClass(): string {
    if (this.density === 'dense') {
      return 'text-[11px]';
    }
    if (this.density === 'compact') {
      return 'text-[12px]';
    }
    return 'text-[13px]';
  }

  badgeSizeClass(): string {
    if (this.density === 'dense') {
      return 'px-1.5 py-0.5 text-[7px]';
    }
    if (this.density === 'compact') {
      return 'px-2 py-0.5 text-[7px]';
    }
    return 'px-2.5 py-1 text-[8px]';
  }

  pillCornerClass(): string {
    const shape = this.shape ?? this.themeService.currentTheme().defaultShape;
    if (shape === 'pill') {
      return 'rounded-full';
    }
    if (shape === 'square') {
      return 'rounded-none';
    }
    return 'rounded-lg';
  }

  cardStyles(): Record<string, string> {
    return {
      'background-color': 'var(--josanz-surface)',
      'border-color': 'var(--josanz-border)',
    };
  }

  private resolvePillKey(): JosanzStatusPillKey {
    const v = this.statusVariant;
    if (v === 'primary') {
      return 'borrador';
    }
    if (v === 'success') {
      return 'confirmado';
    }
    if (v === 'warning') {
      return 'en-proceso';
    }
    if (v === 'error') {
      return 'cancelado';
    }
    return v;
  }

  badgeStyles(): Record<string, string> {
    if (this.customColor) {
      return {
        'background-color': `color-mix(in srgb, ${this.customColor} 16%, var(--josanz-surface))`,
        color: this.customColor,
      };
    }
    const key = this.resolvePillKey();
    return {
      'background-color': `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
