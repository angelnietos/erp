import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { josanzCornerAvatar, type JosanzControlShape } from '../josanz-control-styles';
import { JOSANZ_FIGMA_SHELL } from '../theme/josanz-figma-tokens';
import { JosanzThemeService } from '../services/theme.service';
import {
  resolveJosanzUserRoleBadge,
  type JosanzUserRoleBadge,
} from '../utils/resolve-josanz-user-role-badge';

@Component({
  selector: 'josanz-user-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css',
})
export class UserAvatarComponent {
  private readonly themeService = inject(JosanzThemeService);
  private readonly globalAuth = inject(GlobalAuthStore, { optional: true });

  @Input() link?: string | null;
  @Input() ariaLabel = 'Cuenta y ajustes';
  @Input() size: 'sm' | 'lg' = 'sm';
  @Input() shape?: JosanzControlShape;
  @Input() customColor?: string;
  /** Roles explícitos; si no se pasan, usa la sesión ERP. */
  @Input() roles: readonly string[] | null = null;
  /** Forzar insignia (`superadmin` / `admin`) sin depender de roles. */
  @Input() roleBadge: JosanzUserRoleBadge | null = null;

  effectiveRoleBadge(): JosanzUserRoleBadge | null {
    if (this.roleBadge) {
      return this.roleBadge;
    }
    const sessionRoles = this.roles ?? this.globalAuth?.user()?.roles ?? [];
    return resolveJosanzUserRoleBadge(sessionRoles);
  }

  shellClass(): string {
    const shape = this.avatarCornerRadius();
    const tier = this.effectiveRoleBadge();
    const tierClass = tier ? `josanz-user-avatar--${tier}` : '';
    if (this.size === 'lg') {
      const cursor = this.hasLink() ? 'cursor-pointer' : '';
      return `${shape} josanz-user-avatar ${tierClass} flex items-center justify-center transition-all group w-[64px] h-[64px] min-w-[64px] min-h-[64px] flex-shrink-0 border-2 border-solid ${cursor}`.trim();
    }
    return `${shape} josanz-user-avatar ${tierClass} flex items-center justify-center transition-all group w-[40px] h-[40px] cursor-pointer hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] active:scale-95 border-2 border-solid border-transparent`;
  }

  hasLink(): boolean {
    return typeof this.link === 'string' && this.link.trim().length > 0;
  }

  routerTarget(): string {
    return (this.link ?? '').trim();
  }

  shellStyle(): Record<string, string> {
    const tier = this.effectiveRoleBadge();
    if (tier === 'superadmin') {
      return {
        background: 'linear-gradient(145deg, #fde68a 0%, #fbbf24 48%, #f59e0b 100%)',
        borderColor: '#f59e0b',
        color: '#7c4a03',
      };
    }
    if (tier === 'admin') {
      return {
        background: 'linear-gradient(145deg, #1e3a5f 0%, #0f1e2f 100%)',
        borderColor: '#3b82f6',
        color: '#dbeafe',
      };
    }

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
    const tier = this.effectiveRoleBadge();
    if (tier === 'superadmin') {
      return '#7c4a03';
    }
    if (tier === 'admin') {
      return '#dbeafe';
    }
    return this.customColor ?? this.themeService.currentTheme().atmosphere.textMuted;
  }

  iconSize(): number {
    return this.size === 'lg' ? 30 : 18;
  }

  private effectiveShape(): JosanzControlShape {
    return this.shape ?? this.themeService.currentTheme().defaultShape;
  }

  private avatarCornerRadius(): string {
    return josanzCornerAvatar(this.effectiveShape());
  }

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
