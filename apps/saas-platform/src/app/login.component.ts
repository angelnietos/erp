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
    <div class="login-shell">
      <div class="login-glow login-glow--a"></div>
      <div class="login-glow login-glow--b"></div>
      <div class="login-card">
        <div class="brand">
          <span class="brand-mark">JOSANZ</span>
          <span class="brand-sub">PLATFORM</span>
        </div>
        <p class="eyebrow">Acceso</p>
        <h1 class="title">Panel SaaS</h1>
        <p class="lede">
          Administración para dueños del producto (tenants y módulos).
        </p>

        <label class="field-label" for="pf-email">Email</label>
        <input
          id="pf-email"
          class="field-input"
          type="email"
          [(ngModel)]="email"
          autocomplete="username"
        />
        <label class="field-label" for="pf-password">Contraseña</label>
        <input
          id="pf-password"
          class="field-input"
          type="password"
          [(ngModel)]="password"
          autocomplete="current-password"
        />
        @if (error()) {
          <p class="err">{{ error() }}</p>
        }
        <button type="button" class="btn-submit" [disabled]="loading()" (click)="submit()">
          {{ loading() ? 'Entrando…' : 'Entrar' }}
        </button>
        <p class="hint">
          Cuenta en <code>platform_users</code> (seed):
          <code>platform&#64;josanz.com</code> · contraseña típica del seed:
          Admin123!
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      --bg0: #06070b;
      --bg1: #0c0e14;
      --line: rgba(255, 255, 255, 0.08);
      --muted: rgba(232, 234, 239, 0.55);
      --text: #e8eaef;
      --accent: #e60012;
      --accent-dim: #9a0010;
      --gold: #c9a227;
      display: block;
      min-height: 100vh;
      font-family: 'DM Sans', system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(1200px 600px at 10% -10%, rgba(230, 0, 18, 0.12), transparent 55%),
        radial-gradient(900px 500px at 90% 0%, rgba(201, 162, 39, 0.08), transparent 50%),
        linear-gradient(180deg, var(--bg0) 0%, var(--bg1) 40%, #0a0b10 100%);
    }

    .login-shell {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(1.25rem, 4vw, 2.5rem);
      overflow: hidden;
    }

    .login-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      opacity: 0.35;
    }
    .login-glow--a {
      width: min(480px, 80vw);
      height: min(480px, 80vw);
      top: -12%;
      left: -8%;
      background: rgba(230, 0, 18, 0.35);
    }
    .login-glow--b {
      width: min(360px, 60vw);
      height: min(360px, 60vw);
      bottom: -8%;
      right: -5%;
      background: rgba(201, 162, 39, 0.22);
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: min(420px, 100%);
      padding: clamp(1.75rem, 4vw, 2.25rem);
      border-radius: 14px;
      border: 1px solid var(--line);
      background: linear-gradient(165deg, #12151e 0%, #0d0f16 100%);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
    }

    .login-card::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 4px;
      border-radius: 14px 14px 0 0;
      background: linear-gradient(90deg, var(--accent) 0%, var(--gold) 100%);
    }

    .brand {
      display: inline-flex;
      flex-direction: column;
      line-height: 1;
      padding: 0.35rem 0.75rem;
      margin-bottom: 1.25rem;
      border: 1px solid var(--line);
      border-radius: 4px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent);
    }

    .brand-mark {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: 1.35rem;
      letter-spacing: 0.12em;
      color: var(--text);
    }

    .brand-sub {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 600;
      font-size: 0.7rem;
      letter-spacing: 0.35em;
      color: var(--gold);
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .title {
      margin: 0 0 0.5rem;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      letter-spacing: 0.02em;
      line-height: 1.1;
      background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.75) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .lede {
      margin: 0 0 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--muted);
    }

    .field-label {
      display: block;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.4rem;
    }

    .field-input {
      width: 100%;
      margin-bottom: 1rem;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(0, 0, 0, 0.25);
      color: var(--text);
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .field-input:focus {
      border-color: rgba(230, 0, 18, 0.45);
      box-shadow: 0 0 0 2px rgba(230, 0, 18, 0.12);
    }

    .btn-submit {
      width: 100%;
      margin-top: 0.25rem;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(180deg, #ff1a2e 0%, var(--accent-dim) 100%);
      box-shadow: 0 6px 24px rgba(230, 0, 18, 0.25);
      transition: transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(1.06);
    }

    .btn-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .err {
      color: #ffb4b8;
      font-size: 0.85rem;
      margin: 0 0 0.75rem;
    }

    .hint {
      margin-top: 1.25rem;
      font-size: 0.72rem;
      color: var(--muted);
      line-height: 1.45;
    }

    code {
      font-size: 0.85em;
      color: rgba(232, 234, 239, 0.85);
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
      .post<{ accessToken: string }>('/api/platform/auth/login', {
        email: this.email,
        password: this.password,
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
