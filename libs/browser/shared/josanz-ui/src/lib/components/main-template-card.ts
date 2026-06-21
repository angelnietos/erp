import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import { josanzListFieldWidthClass } from '../list-view/list-template-row-layout';

/** Variantes de pastilla: claves de flujo (`JosanzStatusPillKey`) o alias legacy (`primary`…). */
export type JosanzStatusPillVariant =
  | JosanzStatusPillKey
  | 'primary'
  | 'success'
  | 'warning'
  | 'error';

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

  activeShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }

  getCardStyles() {
    return {
      'background-color': 'var(--josanz-surface)',
      'border-color': 'var(--josanz-border)',
      'box-shadow': 'var(--josanz-card-shadow)',
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
    if (this.customColor) {
      return {
        'background-color': `color-mix(in srgb, ${this.customColor} 16%, var(--josanz-surface))`,
        color: this.customColor,
        'box-shadow': 'var(--josanz-shadow-sm)',
        'text-transform': 'uppercase',
        'letter-spacing': '0.05em',
      };
    }
    const key = this.resolvePillKey();
    return {
      'background-color': `var(--josanz-pill-${key}-bg)`,
      color: `var(--josanz-pill-${key}-text)`,
      'box-shadow': 'var(--josanz-shadow-sm)',
      'text-transform': 'uppercase',
      'letter-spacing': '0.05em',
    };
  }

  /** Barra lateral de estado (Figma listados). */
  getStatusRailStyles() {
    if (this.customColor) {
      return { backgroundColor: this.customColor };
    }
    const key = this.resolvePillKey();
    return { backgroundColor: `var(--josanz-pill-${key}-text)` };
  }

  fieldWidthClass(index: number): string {
    return josanzListFieldWidthClass(index, this.data.length);
  }
}
