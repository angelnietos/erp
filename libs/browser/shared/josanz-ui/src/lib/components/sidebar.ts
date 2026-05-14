import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService, JosanzThemeName, JosanzAtmosphereName } from '../services/theme.service';

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

  brandingColors = ['#635BFF', '#22C55E', '#F59E0B', '#EF4444', '#EC4899', '#222222', '#38BDF8', '#8B5CF6'];

  atmospheres: {name: JosanzAtmosphereName, color: string, label: string}[] = [
    {name: 'luxe', color: '#F8FAFC', label: 'Luxe'},
    {name: 'nature', color: '#F0FDF4', label: 'Nature'},
    {name: 'fire', color: '#FEF2F2', label: 'Fire'},
    {name: 'midnight', color: '#0F172A', label: 'Midnight'},
    {name: 'ocean', color: '#F0F9FF', label: 'Ocean'},
    {name: 'sunset', color: '#FFF7ED', label: 'Sunset'},
    {name: 'cyberpunk', color: '#000000', label: 'Cyber'},
    {name: 'industrial', color: '#27272A', label: 'Indus'},
    {name: 'forest', color: '#ECF3E9', label: 'Forest'},
    {name: 'sakura', color: '#FFF1F2', label: 'Sakura'}
  ];

  toggle() {
    this.isOpen = !this.isOpen;
  }

  changeTheme(name: JosanzThemeName) {
    this.themeService.setTheme(name);
  }

  changeAtmosphere(name: JosanzAtmosphereName) {
    this.themeService.setAtmosphere(name);
  }

  changeBranding(color: string) {
    this.themeService.setPrimaryColor(color);
  }
}
