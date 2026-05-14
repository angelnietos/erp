import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatarComponent {
  private readonly themeService = inject(JosanzThemeService);

  /** Nav bar (40px) vs form placeholder (64px, sin hover de clic). */
  @Input() size: 'sm' | 'lg' = 'sm';
  /** `rounded` = suavizado, `pill` = círculo, `square` = casi cuadrado. */
  @Input() shape: JosanzControlShape = 'rounded';
  /** Fondo del avatar; el icono usa `currentColor` derivado del mismo tono. */
  @Input() customColor?: string;

  shellClass(): string {
    const shape = josanzCornerAvatar(this.shape);
    if (this.size === 'lg') {
      return `${shape} flex items-center justify-center transition-all group w-[64px] h-[64px] min-w-[64px] min-h-[64px] flex-shrink-0 border-2 border-solid`;
    }
    return `${shape} flex items-center justify-center transition-all group w-[40px] h-[40px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] active:scale-95 border-2 border-solid border-transparent`;
  }

  shellStyle(): Record<string, string> {
    const t = this.themeService.currentTheme();
    if (this.customColor) {
      return {
        backgroundColor: this.customColor,
        borderColor: t.atmosphere.border,
      };
    }
    return {
      backgroundColor: `color-mix(in srgb, ${t.primaryColor} 14%, ${t.atmosphere.surface})`,
      borderColor: t.atmosphere.border,
    };
  }

  iconTone(): string {
    return this.customColor ?? this.themeService.currentTheme().atmosphere.text;
  }
}
