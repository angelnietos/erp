import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';

@Component({
  selector: 'josanz-main-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLayoutComponent],
  template: `
    <josanz-app-layout>
      <router-outlet></router-outlet>
    </josanz-app-layout>
  `
})
export class MainShellComponent {}
