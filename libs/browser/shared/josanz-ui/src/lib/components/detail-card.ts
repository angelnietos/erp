import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
import type { JosanzControlShape } from '../josanz-control-styles';

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
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;

  activeShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }

  shellStyle(): Record<string, string> {
    return {
      backgroundColor: 'var(--josanz-surface)',
      borderColor: 'var(--josanz-border)',
      boxShadow: 'var(--josanz-card-shadow)',
    };
  }

  badgeStyle(): Record<string, string> {
    if (this.customColor) {
      return {
        backgroundColor: `color-mix(in srgb, ${this.customColor} 16%, var(--josanz-surface))`,
        color: this.customColor,
      };
    }
    return {
      backgroundColor: 'var(--josanz-status-pill-muted-bg)',
      color: 'var(--josanz-status-pill-muted-text)',
    };
  }
}
