import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <p class="code">404</p>
      <h1>Página no encontrada</h1>
      <p class="hint">La ruta no existe o ha cambiado.</p>
      <a routerLink="/dashboard" class="link">Volver al panel</a>
    </div>
  `,
  styles: `
    .wrap {
      max-width: 28rem;
      margin: 3rem auto;
      padding: 0 1.5rem;
      text-align: center;
    }
    .code {
      margin: 0;
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      opacity: 0.35;
    }
    h1 {
      margin: 0.5rem 0 0.75rem;
      font-size: 1.35rem;
      font-weight: 700;
    }
    .hint {
      margin: 0 0 1.5rem;
      opacity: 0.75;
      font-size: 0.95rem;
    }
    .link {
      display: inline-block;
      font-weight: 600;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-medium, rgba(255, 255, 255, 0.12));
    }
    .link:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `,
})
export class NotFoundComponent {}
