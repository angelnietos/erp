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

  lightAtmospheres: {name: JosanzAtmosphereName, color: string, label: string}[] = [
    {name: 'luxe', color: '#F8FAFC', label: 'Luxe'},
    {name: 'nature', color: '#DCFCE7', label: 'Nature'},
    {name: 'ocean', color: '#E0F2FE', label: 'Ocean'},
    {name: 'forest', color: '#D1E2C4', label: 'Forest'},
    {name: 'sakura', color: '#FFE4E6', label: 'Sakura'}
  ];

  darkAtmospheres: {name: JosanzAtmosphereName, color: string, label: string}[] = [
    {name: 'midnight', color: '#0F172A', label: 'Midnight'},
    {name: 'cyberpunk', color: '#111111', label: 'Cyber'},
    {name: 'industrial', color: '#27272A', label: 'Indus'},
    {name: 'fire', color: '#7F1D1D', label: 'Fire'},
    {name: 'sunset', color: '#7C2D12', label: 'Sunset'}
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
