import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';

@Component({
  selector: 'josanz-main-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLayoutComponent],
  template: `
    <josanz-app-layout (logoutClick)="logoutClick.emit()">
      <router-outlet></router-outlet>
    </josanz-app-layout>
  `
})
export class MainShellComponent {
  /** Bubble to parent when shell is composed outside the router. */
  readonly logoutClick = output<void>();
}
