import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { GlobalAuthStore, PluginStore } from '@josanz-erp/shared-data-access';
import { JosanzSidebarIconComponent } from './sidebar-icon.component';
import {
  JOSANZ_FIGMA_NAV_ITEMS,
  canAccessJosanzSettings,
  filterJosanzFigmaNavItems,
} from '../navigation/josanz-figma-nav';

export type JosanzSidebarIconKey =
  | 'inicio'
  | 'eventos'
  | 'clientes'
  | 'material'
  | 'stock'
  | 'vehiculos'
  | 'staff'
  | 'presupuestos'
  | 'facturacion'
  | 'ajustes'
  | 'salir';

@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, JosanzSidebarIconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  public themeService = inject(JosanzThemeService);
  private readonly globalAuth = inject(GlobalAuthStore);
  private readonly pluginStore = inject(PluginStore);

  @Input() userName = 'Admin Josanz';
  @Input() userRole = 'Administrador';
  @Input() isOpen = false;

  @Output() readonly logoutClick = new EventEmitter<void>();

  readonly logoSrc = '/assets/josanz-figma/login-logo.png';

  readonly filteredNavItems = computed(() =>
    filterJosanzFigmaNavItems(
      JOSANZ_FIGMA_NAV_ITEMS,
      this.globalAuth.permissions(),
      this.pluginStore.enabledPlugins(),
    ),
  );

  readonly canAccessSettings = computed(() =>
    canAccessJosanzSettings(this.globalAuth.permissions()),
  );

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
