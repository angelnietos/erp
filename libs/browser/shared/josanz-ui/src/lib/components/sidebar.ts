import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

export type JosanzSidebarIconKey =
  | 'inicio'
  | 'eventos'
  | 'clientes'
  | 'material'
  | 'vehiculos'
  | 'staff'
  | 'facturacion'
  | 'ajustes'
  | 'salir';

interface JosanzSidebarItem {
  path: string;
  label: string;
  icon: JosanzSidebarIconKey;
  permission?: string;
}

@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  public themeService = inject(JosanzThemeService);
  private readonly globalAuth = inject(GlobalAuthStore);

  @Input() userName = 'Admin Josanz';
  @Input() userRole = 'Administrador';
  @Input() isOpen = false;

  @Output() readonly logoutClick = new EventEmitter<void>();

  readonly logoSrc = '/assets/josanz-figma/login-logo.png';
  readonly iconBase = '/assets/josanz-figma/icons';

  readonly navItems: JosanzSidebarItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'inicio' },
    { path: '/events', label: 'Eventos', icon: 'eventos', permission: 'events.view' },
    { path: '/clients', label: 'Clientes', icon: 'clientes', permission: 'clients.view' },
    { path: '/equipment', label: 'Material AV', icon: 'material', permission: 'products.view' },
    { path: '/vehicles', label: 'Vehículos', icon: 'vehiculos', permission: 'fleet.view' },
    { path: '/staff', label: 'Staff', icon: 'staff', permission: 'users.view' },
    { path: '/billing', label: 'Facturación', icon: 'facturacion', permission: 'billing.view' },
  ];

  iconSrc(key: JosanzSidebarIconKey): string {
    return `${this.iconBase}/${key}.png`;
  }

  readonly filteredNavItems = computed(() => {
    return this.navItems.filter((item) => {
      // If no permission required, always show
      if (!item.permission) {
        return true;
      }
      // Check if user has permission, but don't filter if GlobalAuthStore has no user
      const user = this.globalAuth.user();
      if (!user) {
        return true;
      }
      return this.globalAuth.hasPermission(item.permission);
    });
  });

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
