import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzGridCardDensity } from '../list-view/list-view-preferences';
import type { JosanzStatusBadgeStyle, JosanzStatusPillVariant } from './main-template-card';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';

@Component({
  selector: 'josanz-grid-list-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-list-card.html',
  styleUrl: './grid-list-card.css',
  host: {
    '[class.josanz-grid-list-card-host--compact]': "density === 'compact'",
    '[class.josanz-grid-list-card-host--dense]': "density === 'dense'",
  },
})
export class GridListCardComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() title = '';
  @Input() status = '';
  @Input() statusVariant: JosanzStatusPillVariant = 'borrador';
  @Input() density: JosanzGridCardDensity = 'comfortable';
  @Input() previewLines: string[] = [];
  @Input() fieldLabels: string[] = [];
  @Input() leadingMark = '';
  @Input() statusBadgeStyle: JosanzStatusBadgeStyle = 'filled';
  @Input() shape?: JosanzControlShape;
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

  pillCornerClass(): string {
    return 'rounded-full';
  }

  cardStyles(): Record<string, string> {
    return {
      'background-color': 'var(--josanz-surface)',
      'border-color': 'var(--josanz-border)',
    };
  }

  statusRailStyles(): Record<string, string> {
    if (this.customColor) {
      return { backgroundColor: this.customColor };
    }
    const key = this.resolvePillKey();
    return { backgroundColor: `var(--josanz-pill-${key}-text)` };
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
      if (this.statusBadgeStyle === 'outline') {
        return {
          'background-color': 'transparent',
          color: this.customColor,
          border: `1px solid ${this.customColor}`,
        };
      }
      return {
        'background-color': `color-mix(in srgb, ${this.customColor} 16%, var(--josanz-surface))`,
        color: this.customColor,
      };
    }
    const key = this.resolvePillKey();
    if (this.statusBadgeStyle === 'outline') {
      const color = key === 'facturado' ? 'var(--josanz-pill-facturado-bg)' : `var(--josanz-pill-${key}-text)`;
      return {
        'background-color': 'transparent',
        color: color,
        border: `1px solid ${color}`,
      };
    }
    return {
      'background-color': `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  statusIcon(): string {
    const key = this.resolvePillKey();
    const icons: Partial<Record<JosanzStatusPillKey, string>> = {
      borrador: '✎',
      presupuesto: '€',
      confirmado: '✓',
      'en-proceso': '⚙',
      'en-produccion': '⚙',
      'en-ejecucion': '⚙',
      cancelado: '×',
      incidencia: '!',
      facturado: '📄',
      cerrado: '●',
    };
    return icons[key] ?? '';
  }

  showStatusIcon(): boolean {
    return this.statusBadgeStyle === 'outline' && !!this.statusIcon();
  }
}
