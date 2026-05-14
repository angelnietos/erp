import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import { josanzReadableOnSolid } from '../theme/josanz-theme-tokens';

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

  getCardStyles() {
    const theme = this.themeService.currentTheme();
    return {
      'background-color': theme.atmosphere.surface,
      'border-color': theme.atmosphere.border,
      color: theme.atmosphere.text,
      'box-shadow': theme.atmosphere.shadow,
    };
  }

  getBadgeStyles() {
    const theme = this.themeService.currentTheme();
    
    let borderRadius = '10px';
    if (theme.defaultShape === 'square') borderRadius = '2px';
    if (theme.defaultShape === 'pill') borderRadius = '99px';

    let backgroundColor = '#E2E8F0';
    if (this.statusVariant === 'primary') backgroundColor = theme.primaryColor;
    else if (this.statusVariant === 'success') backgroundColor = '#22C55E';
    else if (this.statusVariant === 'warning') backgroundColor = '#F59E0B';
    else if (this.statusVariant === 'error') backgroundColor = '#EF4444';

    return {
      'background-color': backgroundColor,
      'border-radius': borderRadius,
      color: josanzReadableOnSolid(backgroundColor),
    };
  }
}
