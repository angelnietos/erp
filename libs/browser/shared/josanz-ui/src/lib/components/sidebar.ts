import { Component, EventEmitter, Input, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';

interface JosanzSidebarItem {
  path: string;
  label: string;
  icon: 'home' | 'events' | 'clients' | 'mic' | 'truck' | 'staff' | 'billing';
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

  readonly navItems: JosanzSidebarItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'home' },
    { path: '/events', label: 'Eventos', icon: 'events', permission: 'events.view' },
    { path: '/clients', label: 'Clientes', icon: 'clients', permission: 'clients.view' },
    { path: '/equipment', label: 'Material AV', icon: 'mic', permission: 'products.view' },
    { path: '/vehicles', label: 'Vehículos', icon: 'truck', permission: 'fleet.view' },
    { path: '/staff', label: 'Staff', icon: 'staff', permission: 'users.view' },
    { path: '/billing', label: 'Facturación', icon: 'billing', permission: 'billing.view' },
  ];

  readonly filteredNavItems = computed(() => {
    return this.navItems.filter((item) => {
      if (item.permission && !this.globalAuth.hasPermission(item.permission)) {
        return false;
      }
      return true;
    });
  });

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
