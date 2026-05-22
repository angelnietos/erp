import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';

interface JosanzSidebarItem {
  path: string;
  label: string;
  icon: 'home' | 'events' | 'clients' | 'mic' | 'truck' | 'staff' | 'billing';
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

  @Input() userName = 'Admin Josanz';
  @Input() userRole = 'Administrador';
  @Input() isOpen = false;

  @Output() readonly logoutClick = new EventEmitter<void>();

  readonly navItems: JosanzSidebarItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'home' },
    { path: '/events', label: 'Eventos', icon: 'events' },
    { path: '/clients', label: 'Clientes', icon: 'clients' },
    { path: '/equipment', label: 'Material AV', icon: 'mic' },
    { path: '/vehicles', label: 'Vehículos', icon: 'truck' },
    { path: '/staff', label: 'Staff', icon: 'staff' },
    { path: '/billing', label: 'Facturación', icon: 'billing' },
  ];

  onLogoutClick(): void {
    this.logoutClick.emit();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }
}
