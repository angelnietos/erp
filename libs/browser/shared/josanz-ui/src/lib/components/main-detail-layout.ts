import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { JosanzThemeService } from '../services/theme.service';
import { resolveJosanzUserDisplayName } from '../utils/resolve-josanz-user-display';
import type { JosanzStatusPillKey } from '../theme/josanz-figma-tokens';
import { MainTabsComponent } from './main-tabs';
import { ButtonComponent } from './button';
import { UserAvatarComponent } from './user-avatar';

export type JosanzDetailLayoutVariant = 'default' | 'figma-event';

@Component({
  selector: 'josanz-main-detail-layout',
  standalone: true,
  imports: [CommonModule, MainTabsComponent, ButtonComponent, UserAvatarComponent],
  templateUrl: './main-detail-layout.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class MainDetailLayoutComponent {
  readonly themeService = inject(JosanzThemeService);
  private readonly globalAuth = inject(GlobalAuthStore);

  @Input() title = '';
  @Input() tabs: string[] = [];
  @Input() activeTab = '';
  @Input() saveLabel = 'Guardar cambios';
  @Input() cancelLabel = 'Cancelar';
  @Input() layoutVariant: JosanzDetailLayoutVariant = 'default';
  @Input() statusLabel = '';
  @Input() statusPillKey: JosanzStatusPillKey = 'confirmado';
  /** Si vacío, usa el usuario de sesión ERP. */
  @Input() userLabel = '';
  @Input() avatarLink: string | null = '/settings';
  @Input() avatarAriaLabel = 'Cuenta y ajustes';

  readonly resolvedUserLabel = computed(() => {
    const explicit = this.userLabel.trim();
    if (explicit) {
      return explicit;
    }
    return resolveJosanzUserDisplayName(this.globalAuth.user());
  });

  @Input() showFooterActions = true;
  /** Botón guardar en la barra de tabs (solo `figma-event`). */
  @Input() showHeaderSave = true;
  @Input() saveDisabled = true;
  /** Pestañas con icono de alerta (detalle Figma). */
  @Input() tabAlerts: Record<string, boolean> = {};

  @Output() back = new EventEmitter<void>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  statusPillBg(): string {
    return `var(--josanz-pill-${this.statusPillKey}-bg)`;
  }

  statusPillText(): string {
    return `var(--josanz-pill-${this.statusPillKey}-text)`;
  }
}
