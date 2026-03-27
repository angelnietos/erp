import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="topnav">
      <a routerLink="/budgets" routerLinkActive="active">Presupuestos</a>
      <a routerLink="/verifactu" routerLinkActive="active">Verifactu</a>
      <a routerLink="/auth/login" class="right">Login</a>
    </nav>
  `,
  styles: [`
    .topnav {
      display: flex; gap: 16px; padding: 12px 16px;
      background: var(--bg-medium); border-bottom: 1px solid var(--border-color);
    }
    a { color: var(--text-light); text-decoration: none; }
    a.active { color: white; font-weight: 600; }
    .right { margin-left: auto; color: var(--text-dim); }
  `],
})
export class AppNavComponent {}

