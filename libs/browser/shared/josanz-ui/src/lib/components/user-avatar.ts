import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { josanzCornerAvatar, type JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';
import { JosanzThemeService } from '../services/theme.service';

@Component({
  selector: 'josanz-user-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatarComponent {
  private readonly themeService = inject(JosanzThemeService);

  /**
   * Ruta interna al pulsar el avatar (p. ej. `/settings`).
   * Si se omite, el avatar es solo decorativo (formularios, etc.).
   */
  @Input() link?: string | null;
  /** Texto accesible cuando `link` está definido. */
  @Input() ariaLabel = 'Cuenta y ajustes';

  /** Nav bar (40px) vs form placeholder (64px, sin hover de clic). */
  @Input() size: 'sm' | 'lg' = 'sm';
  /** `rounded` = suavizado, `pill` = círculo, `square` = casi cuadrado. Si no se pasa, usa el tema activo. */
  @Input() shape?: JosanzControlShape;
  /** Fondo del avatar; el icono usa `currentColor` derivado del mismo tono. */
  @Input() customColor?: string;

  shellClass(): string {
    const shape = this.avatarCornerRadius();
    if (this.size === 'lg') {
      const cursor = this.hasLink() ? 'cursor-pointer' : '';
      return `${shape} flex items-center justify-center transition-all group w-[64px] h-[64px] min-w-[64px] min-h-[64px] flex-shrink-0 border-2 border-solid ${cursor}`.trim();
    }
    return `${shape} flex items-center justify-center transition-all group w-[40px] h-[40px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] active:scale-95 border-2 border-solid border-transparent`;
  }

  hasLink(): boolean {
    return typeof this.link === 'string' && this.link.trim().length > 0;
  }

  routerTarget(): string {
    return (this.link ?? '').trim();
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
      backgroundColor: JOSANZ_FIGMA_SHELL.avatarWash,
      borderColor: t.atmosphere.border,
    };
  }

  iconTone(): string {
    return this.customColor ?? this.themeService.currentTheme().atmosphere.textMuted;
  }

  private effectiveShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }

  private avatarCornerRadius(): string {
    return josanzCornerAvatar(this.effectiveShape());
  }

  /** Clases del `<a>` con enlace: mismas que el bloque decorativo + utilidades de foco (sin `rounded-[inherit]`). */
  linkShellClass(): string {
    return [
      this.shellClass(),
      'no-underline',
      'text-inherit',
      'outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[var(--josanz-primary)]',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-[var(--josanz-bg)]',
    ].join(' ');
  }
}
