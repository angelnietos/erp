import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import { JosanzSidebarIconComponent } from './sidebar-icon.component';

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

interface JosanzSidebarItem {
  path: string;
  label: string;
  icon: JosanzSidebarIconKey;
  permission?: string;
  exact?: boolean;
}

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

  @Input() userName = 'Admin Josanz';
  @Input() userRole = 'Administrador';
  @Input() isOpen = false;

  @Output() readonly logoutClick = new EventEmitter<void>();

  readonly logoSrc = '/assets/josanz-figma/login-logo.png';

  readonly navItems: JosanzSidebarItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'inicio', exact: true },
    { path: '/events', label: 'Eventos', icon: 'eventos', permission: 'events.view' },
    { path: '/clients', label: 'Clientes', icon: 'clientes', permission: 'clients.view' },
    { path: '/equipment', label: 'Material AV', icon: 'material', permission: 'products.view' },
    { path: '/stock', label: 'Stock', icon: 'stock', permission: 'products.view' },
    { path: '/vehicles', label: 'Vehículos', icon: 'vehiculos', permission: 'fleet.view' },
    { path: '/staff', label: 'Staff', icon: 'staff', permission: 'users.view' },
    { path: '/budgets', label: 'Presupuestos', icon: 'presupuestos', permission: 'billing.view' },
    { path: '/billing', label: 'Facturación', icon: 'facturacion', permission: 'billing.view' },
  ];

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
