import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzGridCardDensity } from '../list-view/list-view-preferences';
import type { JosanzStatusBadgeStyle, JosanzStatusPillVariant } from './main-template-card';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import {
  eventOutlineBadgeStyles,
  eventOutlineIconRingStyles,
  getEventOutlinePill,
} from '../theme/event-status-outline';
import {
  leadingMarkGradientStyle,
  pillFilledBadgeStyles,
  pillOutlineBadgeStyles,
} from '../catalog/status-pill-presets';

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
  @Input() railColor = '';
  @Input() pillColor = '';
  @Input() avatarGradient = false;
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
      'background-color': 'var(--josanz-list-card-bg, var(--josanz-surface))',
      'border-color': 'var(--josanz-list-card-border, var(--josanz-border))',
      'box-shadow': 'var(--josanz-list-card-shadow, var(--josanz-card-shadow))',
    };
  }

  leadingMarkStyles(): Record<string, string> {
    if (this.avatarGradient && this.leadingMark && this.railColor) {
      const pillAccent = this.pillColor || this.customColor;
      if (pillAccent) {
        return leadingMarkGradientStyle(this.railColor, pillAccent);
      }
    }
    return {};
  }

  statusRailStyles(): Record<string, string> {
    if (this.railColor) {
      return { backgroundColor: this.railColor };
    }
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
    const accent = this.pillColor || this.customColor;
    if (accent) {
      if (this.statusBadgeStyle === 'outline') {
        return pillOutlineBadgeStyles(accent);
      }
      return pillFilledBadgeStyles(accent);
    }
    const key = this.resolvePillKey();
    if (this.statusBadgeStyle === 'outline') {
      return eventOutlineBadgeStyles(key);
    }
    return {
      'background-color': `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
    };
  }

  statusIcon(): string {
    if (this.statusBadgeStyle === 'outline') {
      return getEventOutlinePill(this.resolvePillKey()).icon;
    }
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

  statusIconRingStyles(): Record<string, string> {
    return eventOutlineIconRingStyles(this.resolvePillKey());
  }

  showStatusIcon(): boolean {
    return this.statusBadgeStyle === 'outline' && !!this.statusIcon();
  }
}
