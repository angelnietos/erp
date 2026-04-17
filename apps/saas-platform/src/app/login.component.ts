import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { setPlatformToken } from './platform-auth.interceptor';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        <h1>JOSANZ Platform</h1>
        <p class="sub">Panel de administración SaaS (dueños del producto)</p>
        <label for="pf-email">Email</label>
        <input
          id="pf-email"
          type="email"
          [(ngModel)]="email"
          autocomplete="username"
        />
        <label for="pf-password">Contraseña</label>
        <input
          id="pf-password"
          type="password"
          [(ngModel)]="password"
          autocomplete="current-password"
        />
        @if (error()) {
          <p class="err">{{ error() }}</p>
        }
        <button type="button" [disabled]="loading()" (click)="submit()">
          Entrar
        </button>
        <p class="hint">
          Usuario seed: <code>platform&#64;josanz.com</code> · tenant
          <code>josanz-platform</code> (misma contraseña que el seed:
          Admin123!)
        </p>
      </div>
    </div>
  `,
  styles: `
    .login-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(
        circle at 20% 20%,
        #1e293b 0%,
        #0f172a 45%,
        #020617 100%
      );
      color: #e2e8f0;
      font-family: system-ui, sans-serif;
    }
    .login-card {
      width: min(420px, 92vw);
      padding: 2rem;
      border-radius: 1rem;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45);
    }
    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.35rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .sub {
      margin: 0 0 1.5rem;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      margin-bottom: 0.35rem;
    }
    input {
      width: 100%;
      margin-bottom: 1rem;
      padding: 0.6rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #334155;
      background: #0f172a;
      color: #f8fafc;
    }
    button {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.65rem;
      border: none;
      border-radius: 0.5rem;
      background: #dc2626;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .err {
      color: #fca5a5;
      font-size: 0.85rem;
    }
    .hint {
      margin-top: 1.25rem;
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1.4;
    }
    code {
      color: #cbd5e1;
    }
  `,
})
export class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  email = 'platform@josanz.com';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.error.set(null);
    this.loading.set(true);
    this.http
      .post<{ accessToken: string }>('/api/auth/login', {
        email: this.email,
        password: this.password,
        tenantSlug: 'josanz-platform',
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (r) => {
          setPlatformToken(r.accessToken);
          void this.router.navigateByUrl('/');
        },
        error: (e: { error?: { message?: string } }) => {
          this.error.set(
            e?.error?.message ?? 'No se pudo iniciar sesión.',
          );
        },
      });
  }
}
