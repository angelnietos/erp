import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';

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
  @Input() statusVariant: 'primary' | 'success' | 'warning' | 'error' = 'warning';
  @Input() data: string[] = ['ID: #4502', 'Fecha: 12/05/2026', 'Total: 1.250€', 'Vencimiento: 30 días'];
  /** Labels shown inline on mobile next to each data value. Should match data array length. */
  @Input() labels: string[] = [];

  getCardStyles() {
    return {
      'background-color': 'var(--josanz-surface)',
      'border-color': 'var(--josanz-border)',
      'box-shadow': JOSANZ_FIGMA_SHELL.cardShadow,
    };
  }

  getBadgeStyles() {
    const theme = this.themeService.currentTheme();

    let backgroundColor = 'var(--josanz-badge-neutral)';
    let color = 'var(--josanz-text)';
    if (this.statusVariant === 'primary') {
      backgroundColor = theme.primaryColor;
      color = josanzReadableOnSolid(theme.primaryColor);
    } else if (this.statusVariant === 'success') {
      backgroundColor = 'var(--josanz-success)';
      color = '#ffffff';
    } else if (this.statusVariant === 'warning') {
      backgroundColor = 'var(--josanz-warning)';
      color = '#0f172a';
    } else if (this.statusVariant === 'error') {
      backgroundColor = 'var(--josanz-danger)';
      color = 'var(--josanz-on-danger)';
    }

    return {
      'background-color': backgroundColor,
      color,
      'box-shadow': 'var(--josanz-shadow-sm)',
      'text-transform': 'uppercase',
      'letter-spacing': '0.05em',
    };
  }
}
