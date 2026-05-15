import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'lib-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-card.html',
  styleUrl: './detail-card.css',
})
export class DetailCardComponent {
  readonly themeService = inject(JosanzThemeService);

  @Input() imageUrl?: string;
  @Input() title!: string;
  @Input() badgeText?: string;
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() data: string[] = [];
  @Input() tags: string[] = [];

  shellStyle(): Record<string, string> {
    const a = this.themeService.currentTheme().atmosphere;
    return {
      backgroundColor: a.surface,
      borderColor: a.border,
      boxShadow: a.shadow,
    };
  }

  badgeStyle(): Record<string, string> {
    return {
      backgroundColor: 'var(--josanz-status-pill-muted-bg)',
      color: 'var(--josanz-status-pill-muted-text)',
    };
  }
}
