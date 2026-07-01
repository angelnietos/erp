import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import {
  eventOutlineBadgeStyles,
  eventOutlineIconRingStyles,
  getEventOutlinePill,
} from '../theme/event-status-outline';
import {
  leadingMarkAvatarStyle,
  pillFilledBadgeStyles,
  pillOutlineBadgeStyles,
  pillOutlineIconRingStyles,
} from '../catalog/status-pill-presets';
import { josanzListFieldWidthClass } from '../list-view/list-template-row-layout';

/** Variantes de pastilla: claves de flujo (`JosanzStatusPillKey`) o alias legacy (`primary`…). */
export type JosanzStatusPillVariant =
  | JosanzStatusPillKey
  | 'primary'
  | 'success'
  | 'warning'
  | 'error';

export type JosanzStatusBadgeStyle = 'filled' | 'outline';

@Component({
  selector: 'josanz-main-template-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-template-card.html',
  styleUrl: './main-template-card.css',
})
export class MainTemplateCardComponent {
  public themeService = inject(JosanzThemeService);

  @Input() title = 'Facturación General';
  @Input() status = 'Pendiente';
  @Input() statusVariant: JosanzStatusPillVariant = 'warning';
  @Input() data: string[] = [
    'ID: #4502',
    'Fecha: 12/05/2026',
    'Total: 1.250€',
    'Vencimiento: 30 días',
  ];
  /** Labels shown inline on mobile next to each data value. Should match data array length. */
  @Input() labels: string[] = [];
  @Input() leadingMark = '';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  @Input() railColor?: string;
  /** Color personalizado de la pastilla de estado/tipo. */
  @Input() pillColor?: string;
  /** @deprecated El avatar usa `railColor` sólido cuando hay `leadingMark`. */
  @Input() avatarGradient = false;
  /** `outline` = pastilla con borde (Figma Eventos). */
  @Input() statusBadgeStyle: JosanzStatusBadgeStyle = 'filled';

  activeShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }

  getCardStyles() {
    return {
      'background-color': 'var(--josanz-list-card-bg, var(--josanz-surface))',
      'border-color': 'var(--josanz-list-card-border, var(--josanz-border))',
      'box-shadow': 'var(--josanz-list-card-shadow, var(--josanz-card-shadow))',
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

  getBadgeStyles() {
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
      'box-shadow': 'var(--josanz-shadow-sm)',
      'text-transform': 'uppercase',
      'letter-spacing': '0.05em',
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
      pospuesto: '⏸',
      finalizado: '✓',
    };
    return icons[key] ?? '';
  }

  statusIconRingStyles(): Record<string, string> {
    const accent = this.pillColor || this.customColor;
    if (accent && this.statusBadgeStyle === 'outline') {
      return pillOutlineIconRingStyles(accent);
    }
    return eventOutlineIconRingStyles(this.resolvePillKey());
  }

  showStatusIcon(): boolean {
    return this.statusBadgeStyle === 'outline' && !!this.statusIcon();
  }

  /** Barra lateral izquierda: tipología/venue (`railColor`), no el estado del evento. */
  getStatusRailStyles() {
    if (this.railColor) {
      return { backgroundColor: this.railColor };
    }
    const key = this.resolvePillKey();
    if (this.statusBadgeStyle === 'outline') {
      return { backgroundColor: getEventOutlinePill(key).border };
    }
    if (this.customColor) {
      return { backgroundColor: this.customColor };
    }
    return { backgroundColor: `var(--josanz-pill-${key}-text)` };
  }

  fieldWidthClass(index: number): string {
    return josanzListFieldWidthClass(index, this.data.length);
  }

  showStatusRail(): boolean {
    return !(this.leadingMark && this.railColor);
  }

  getLeadingMarkStyles(): Record<string, string> {
    if (this.leadingMark && this.railColor) {
      return leadingMarkAvatarStyle(this.railColor);
    }
    return {
      borderColor: 'var(--josanz-border)',
      backgroundColor: 'var(--josanz-surface-muted)',
      color: 'var(--josanz-text)',
    };
  }
}
