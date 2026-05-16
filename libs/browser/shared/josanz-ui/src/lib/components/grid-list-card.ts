import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzStatusPillVariant } from './main-template-card';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';

@Component({
  selector: 'josanz-grid-list-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="josanz-grid-list-card flex h-full min-h-0 w-full flex-col border border-solid p-4 text-left transition-all duration-200 hover:brightness-[0.98] active:scale-[0.99]"
      [ngClass]="cornerClass()"
      [ngStyle]="cardStyles()"
    >
      <header class="mb-3 flex min-w-0 items-start justify-between gap-2">
        <h3
          class="m-0 truncate text-[15px] font-extrabold leading-tight tracking-tight"
          [style.color]="'var(--josanz-text)'"
        >
          {{ title }}
        </h3>
        @if (status) {
          <span
            class="shrink-0 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider"
            [ngClass]="pillCornerClass()"
            [ngStyle]="badgeStyles()"
          >
            {{ status }}
          </span>
        }
      </header>

      <div class="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-hidden">
        @for (line of previewLines; track $index) {
          <div class="min-w-0">
            @if (fieldLabels[$index]) {
              <span
                class="mb-0.5 block truncate text-[9px] font-bold uppercase tracking-wider"
                [style.color]="'var(--josanz-text-muted)'"
              >
                {{ fieldLabels[$index] }}
              </span>
            }
            <span class="block truncate text-[13px] font-semibold leading-snug" [style.color]="'var(--josanz-text)'">
              {{ line }}
            </span>
          </div>
        }
      </div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        aspect-ratio: 1;
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
  /** Valores mostrados en el cuerpo (típicamente los 2–3 primeros campos). */
  @Input() previewLines: string[] = [];
  @Input() fieldLabels: string[] = [];

  cornerClass(): string {
    const shape = this.themeService.currentTheme().defaultShape;
    if (shape === 'square') {
      return 'rounded-none';
    }
    if (shape === 'pill') {
      return 'rounded-[28px]';
    }
    return 'rounded-2xl';
  }

  pillCornerClass(): string {
    const shape = this.themeService.currentTheme().defaultShape;
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
    const key = this.resolvePillKey();
    return {
      'background-color': `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }
}
