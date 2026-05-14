import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JosanzThemeService } from '../services/theme.service';
import { ThemeModalComponent } from './theme-modal';

@Component({
  selector: 'josanz-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeModalComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  public themeService = inject(JosanzThemeService);

  @Input() userName = 'Admin Josanz';
  @Input() userRole = 'Administrador';
  @Input() isOpen = false;

  showThemeModal = signal(false);

  toggle() {
    this.isOpen = !this.isOpen;
  }

  openThemeSettings() {
    this.showThemeModal.set(true);
  }

  closeThemeSettings() {
    this.showThemeModal.set(false);
  }
}
