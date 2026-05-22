import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JosanzThemeService } from '../services/theme.service';
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

  @Input() title = '';
  @Input() tabs: string[] = [];
  @Input() activeTab = '';
  @Input() saveLabel = 'Guardar cambios';
  @Input() cancelLabel = 'Cancelar';
  @Input() layoutVariant: JosanzDetailLayoutVariant = 'default';
  @Input() statusLabel = '';
  @Input() statusPillKey: JosanzStatusPillKey = 'confirmado';
  @Input() userLabel = 'Usuari@';
  @Input() avatarLink: string | null = '/settings';
  @Input() avatarAriaLabel = 'Cuenta y ajustes';

  @Input() showFooterActions = true;
  @Input() saveDisabled = true;

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
