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
        background: 'linear-gradient(135deg, #1e0b38 0%, #3b1877 50%, #5b21b6 100%)',
        borderColor: '#7c3aed',
        color: '#ffffff',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
      };
    }
    if (tier === 'admin') {
      return {
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0d9488 100%)',
        borderColor: '#14b8a6',
        color: '#ffffff',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
      };
    }
    if (tier === 'manager') {
      return {
        background: 'linear-gradient(135deg, #061121 0%, #1e3a8a 50%, #1d4ed8 100%)',
        borderColor: '#3b82f6',
        color: '#ffffff',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
      };
    }
    if (tier === 'operator') {
      return {
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
        borderColor: '#6b7280',
        color: '#ffffff',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
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
    if (tier === 'superadmin' || tier === 'admin' || tier === 'manager' || tier === 'operator') {
      return '#ffffff';
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
