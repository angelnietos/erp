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

  atmospheres: {name: JosanzAtmosphereName, color: string, label: string}[] = [
    {name: 'luxe', color: '#635BFF', label: 'Luxe'},
    {name: 'nature', color: '#10B981', label: 'Nature'},
    {name: 'fire', color: '#EF4444', label: 'Fire'},
    {name: 'midnight', color: '#38BDF8', label: 'Midnight'},
    {name: 'ocean', color: '#0EA5E9', label: 'Ocean'},
    {name: 'sunset', color: '#F59E0B', label: 'Sunset'},
    {name: 'cyberpunk', color: '#D946EF', label: 'Cyber'},
    {name: 'industrial', color: '#FACC15', label: 'Indus'},
    {name: 'forest', color: '#4D7C0F', label: 'Forest'},
    {name: 'sakura', color: '#EC4899', label: 'Sakura'}
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
}
