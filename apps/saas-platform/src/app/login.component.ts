import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { setPlatformToken } from './platform-auth.interceptor';
import { KeycloakAuthService } from './keycloak-auth.service';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-shell">
      <div class="login-glow login-glow--a"></div>
      <div class="login-glow login-glow--b"></div>
      <div class="login-card">
        @if (keycloakHandoffPending()) {
          <div class="handoff" role="status" aria-live="polite">
            <span class="handoff-spinner" aria-hidden="true"></span>
            <p class="handoff-title">Redirigiendo a Keycloak…</p>
            <p class="handoff-lede">Verificando el servidor de identidad del panel SaaS.</p>
          </div>
        } @else {
          <div class="brand">
            <span class="brand-mark">BABOONI</span>
            <span class="brand-sub">PLATFORM</span>
          </div>
          <p class="eyebrow">Acceso</p>
          <h1 class="title">Panel de producto</h1>
          <p class="lede">
            Administración de organizaciones, módulos y observabilidad (Babooni).
          </p>
          <div
            class="auth-status"
            [class.auth-status--local]="authMode() === 'local'"
            [class.auth-status--keycloak]="authMode() === 'keycloak'"
          >
            <span class="auth-status-dot"></span>
            <span>{{ authStatusLabel() }}</span>
          </div>

          @if (showKeycloakRetryButton()) {
            <button type="button" class="btn-sso" (click)="startKeycloakSso()">
              Entrar con Keycloak
            </button>
          }

          @if (showLocalLoginForm()) {
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
              @if (loading()) {
                <span class="btn-submit-inner">
                  <span class="sp-loading-dots" aria-hidden="true">
                    <span></span><span></span><span></span>
                  </span>
                  {{ loadingLabel() }}
                </span>
              } @else {
                Entrar con acceso local
              }
            </button>

            <div class="dev-hint">
              <p class="dev-hint-kicker">Solo desarrollo</p>
              <p class="hint">
                Fallback <code>platform_users</code>:
                <code>platform&#64;babooni.com</code> · Admin123!
              </p>
            </div>
          }
        }
      </div>

      @if (erpHubUrl) {
        <a class="hub-link" [href]="erpHubUrl">← Hub de aplicaciones (ERP)</a>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        font-family: var(--sp-font-sans);
        color: var(--sp-text);
        background: transparent;
      }

      .login-shell {
        position: relative;
        isolation: isolate;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(1.25rem, 4vw, 2.75rem);
        overflow: hidden;
      }

      .login-shell::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          700px 420px at 50% 120%,
          rgba(0, 75, 147, 0.12),
          transparent 55%
        );
        pointer-events: none;
        z-index: 0;
      }

      .login-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(88px);
        pointer-events: none;
        opacity: 0.4;
        z-index: 0;
      }
      .login-glow--a {
        width: min(520px, 85vw);
        height: min(520px, 85vw);
        top: -14%;
        left: -10%;
        background: rgba(0, 75, 147, 0.42);
      }
      .login-glow--b {
        width: min(380px, 65vw);
        height: min(380px, 65vw);
        bottom: -10%;
        right: -6%;
        background: rgba(89, 168, 244, 0.22);
      }

      .login-card {
        position: relative;
        z-index: 1;
        width: min(440px, 100%);
        padding: clamp(1.85rem, 4.5vw, 2.4rem);
        border-radius: var(--sp-radius-lg);
        border: 1px solid var(--sp-line);
        background: linear-gradient(
          165deg,
          rgba(18, 21, 30, 0.96) 0%,
          rgba(11, 13, 20, 0.98) 100%
        );
        box-shadow: var(--sp-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
      }

      .login-card::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 3px;
        border-radius: var(--sp-radius-lg) var(--sp-radius-lg) 0 0;
        background: linear-gradient(90deg, var(--sp-accent) 0%, var(--sp-gold) 55%, var(--sp-accent) 100%);
        background-size: 200% 100%;
        animation: sp-shimmer 8s ease-in-out infinite;
      }

      .handoff {
        text-align: center;
        padding: 1.5rem 0.5rem 0.75rem;
      }

      .handoff-spinner {
        display: inline-block;
        width: 2.25rem;
        height: 2.25rem;
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-top-color: var(--sp-accent-secondary);
        border-radius: 50%;
        animation: spin 0.85s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .handoff-title {
        margin: 0 0 0.45rem;
        font-family: var(--sp-font-display);
        font-size: 1.25rem;
      }

      .handoff-lede {
        margin: 0;
        color: var(--sp-muted);
        font-size: 0.88rem;
      }

      .brand {
        display: inline-flex;
        flex-direction: column;
        line-height: 1;
        padding: 0.4rem 0.85rem;
        margin-bottom: 1.35rem;
        border: 1px solid var(--sp-line);
        border-radius: 6px;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), transparent);
        box-shadow: var(--sp-shadow-soft);
      }

      .brand-mark {
        font-family: var(--sp-font-display);
        font-weight: 700;
        font-size: 1.4rem;
        letter-spacing: 0.14em;
        color: var(--sp-text);
      }

      .brand-sub {
        font-family: var(--sp-font-display);
        font-weight: 600;
        font-size: 0.68rem;
        letter-spacing: 0.38em;
        color: var(--sp-accent-secondary);
      }

      .eyebrow {
        margin: 0 0 0.4rem;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--sp-muted);
      }

      .title {
        margin: 0 0 0.55rem;
        font-family: var(--sp-font-display);
        font-weight: 700;
        font-size: clamp(1.85rem, 4.2vw, 2.35rem);
        letter-spacing: 0.02em;
        line-height: 1.08;
        background: linear-gradient(95deg, #fff 0%, rgba(255, 255, 255, 0.72) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .lede {
        margin: 0 0 1rem;
        font-size: 0.92rem;
        line-height: 1.55;
        color: var(--sp-muted);
      }

      .auth-status {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin: 0 0 1.4rem;
        padding: 0.38rem 0.62rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.11);
        background: rgba(255, 255, 255, 0.05);
        color: var(--sp-muted);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .auth-status--keycloak {
        color: #9be7b0;
        border-color: rgba(78, 202, 114, 0.32);
        background: rgba(78, 202, 114, 0.08);
      }

      .auth-status--local {
        color: #ffd784;
        border-color: rgba(201, 162, 39, 0.38);
        background: rgba(201, 162, 39, 0.1);
      }

      .auth-status-dot {
        width: 0.48rem;
        height: 0.48rem;
        border-radius: 999px;
        background: currentColor;
        box-shadow: 0 0 12px currentColor;
      }

      .btn-sso {
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.82rem 1rem;
        border: 1px solid rgba(78, 202, 114, 0.35);
        border-radius: var(--sp-radius-sm);
        background: rgba(78, 202, 114, 0.12);
        color: #d7ffe3;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .field-label {
        display: block;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--sp-muted);
        margin-bottom: 0.45rem;
      }

      .field-input {
        width: 100%;
        margin-bottom: 1.05rem;
        padding: 0.72rem 0.95rem;
        border-radius: var(--sp-radius-sm);
        border: 1px solid rgba(255, 255, 255, 0.11);
        background: rgba(0, 0, 0, 0.32);
        color: var(--sp-text);
        font-family: inherit;
        font-size: 0.92rem;
        outline: none;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      }

      .field-input:hover {
        border-color: rgba(255, 255, 255, 0.16);
      }

      .field-input:focus {
        border-color: rgba(89, 168, 244, 0.65);
        box-shadow: 0 0 0 3px var(--sp-accent-soft);
        background: rgba(0, 0, 0, 0.38);
      }

      .btn-submit {
        width: 100%;
        margin-top: 0.35rem;
        padding: 0.82rem 1rem;
        border: none;
        border-radius: var(--sp-radius-sm);
        font-family: inherit;
        font-size: 0.86rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(185deg, #0a5cb8 0%, var(--sp-accent-dim) 100%);
        box-shadow: 0 10px 32px rgba(0, 75, 147, 0.35);
        transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease,
          box-shadow 0.18s ease;
      }

      .btn-submit-inner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-submit:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.06);
        box-shadow: 0 14px 40px rgba(0, 75, 147, 0.4);
      }

      .btn-submit:disabled {
        opacity: 0.58;
        cursor: not-allowed;
      }

      .err {
        color: var(--sp-danger-text);
        font-size: 0.86rem;
        margin: 0 0 0.85rem;
        padding: 0.55rem 0.65rem;
        border-radius: var(--sp-radius-sm);
        border: 1px solid rgba(230, 0, 18, 0.28);
        background: rgba(230, 0, 18, 0.08);
      }

      .dev-hint {
        margin-top: 1.35rem;
        padding: 0.75rem 0.85rem;
        border-radius: var(--sp-radius-sm);
        border: 1px dashed rgba(89, 168, 244, 0.35);
        background: linear-gradient(135deg, rgba(0, 75, 147, 0.12), transparent);
      }

      .dev-hint-kicker {
        margin: 0 0 0.35rem;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(89, 168, 244, 0.9);
      }

      .hint {
        margin: 0;
        font-size: 0.74rem;
        color: var(--sp-muted);
        line-height: 1.5;
      }

      code {
        font-size: 0.88em;
        color: rgba(232, 234, 239, 0.9);
        padding: 0.08em 0.28em;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .hub-link {
        position: relative;
        z-index: 2;
        margin-top: 1.15rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--sp-muted);
        text-decoration: none;
        transition: color 0.15s ease;
      }

      .hub-link:hover {
        color: var(--sp-accent-secondary);
      }

      @media (prefers-reduced-motion: reduce) {
        .login-card::before {
          animation: none;
          background: linear-gradient(90deg, var(--sp-accent) 0%, var(--sp-gold) 100%);
        }
        .handoff-spinner {
          animation: none;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(KeycloakAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly erpHubUrl = environment.erpHubUrl?.trim() ?? '';

  email = 'platform@babooni.com';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly authMode = this.auth.authMode;
  readonly loadingLabel = signal('Entrando…');
  readonly pkceRedirectLoading = signal(false);
  readonly keycloakReachable = signal<boolean | null>(null);
  readonly keycloakRedirectAborted = signal(false);
  readonly forceLocalLogin = signal(
    this.route.snapshot.queryParamMap.get('local') === '1',
  );

  readonly showLocalLoginForm = computed(() => {
    if (this.forceLocalLogin()) {
      return true;
    }
    if (!this.auth.canUsePlatformKeycloakPkce()) {
      return true;
    }
    if (this.keycloakRedirectAborted()) {
      return true;
    }
    return this.keycloakReachable() === false;
  });

  readonly keycloakHandoffPending = computed(() => {
    if (!this.auth.canUsePlatformKeycloakPkce()) {
      return false;
    }
    if (this.forceLocalLogin()) {
      return false;
    }
    if (this.keycloakRedirectAborted()) {
      return false;
    }
    const reachable = this.keycloakReachable();
    if (reachable === false) {
      return false;
    }
    return reachable === null || this.pkceRedirectLoading();
  });

  readonly showKeycloakRetryButton = computed(
    () =>
      this.keycloakRedirectAborted() &&
      this.keycloakReachable() === true &&
      !this.pkceRedirectLoading(),
  );

  readonly authStatusLabel = computed(() => {
    if (this.keycloakHandoffPending()) {
      return 'Conectando con Keycloak…';
    }
    if (this.authMode() === 'keycloak') {
      return 'Keycloak SSO activo';
    }
    if (this.showLocalLoginForm()) {
      return this.keycloakReachable() === false
        ? 'Acceso local: Keycloak no disponible'
        : 'Acceso local de respaldo';
    }
    return 'Keycloak SSO preferido';
  });

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.error.set('La sesión ha caducado. Vuelve a iniciar sesión.');
    }
    if (reason === 'kc_error') {
      const msg = this.route.snapshot.queryParamMap.get('msg');
      this.error.set(
        msg
          ? `Keycloak no completó el login (${msg}). Usa acceso local o reintenta SSO.`
          : 'Keycloak no completó el login. Usa acceso local o reintenta SSO.',
      );
      this.forceLocalLogin.set(true);
      this.keycloakRedirectAborted.set(true);
    }

    this.pkceRedirectLoading.set(false);
    if (this.isBackForwardNavigation() && this.auth.consumeRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
      if (!this.error()) {
        this.error.set(
          'Volviste desde Keycloak sin completar el login. Puedes usar acceso local o reintentar SSO.',
        );
      }
    } else if (reason !== 'kc_error') {
      this.auth.clearRedirectPending();
    }

    if (this.auth.canUsePlatformKeycloakPkce() && !this.forceLocalLogin()) {
      this.auth.checkPlatformSsoReady().subscribe({
        next: (check) => {
          this.keycloakReachable.set(check.realmReachable);
          if (!check.ready) {
            if (!check.realmReachable) {
              this.error.set('Keycloak no responde. Usando acceso local.');
            } else if (!check.redirectUriAllowed) {
              this.error.set(
                check.hint ??
                  'Keycloak no tiene registrado el redirect URI del panel. Ejecuta `pnpm keycloak:sync`.',
              );
            }
            return;
          }
          if (!this.keycloakRedirectAborted()) {
            void this.startKeycloakSso();
          }
        },
        error: () => {
          this.keycloakReachable.set(false);
          this.error.set('No se pudo verificar Keycloak. Usando acceso local.');
        },
      });
    } else if (!this.forceLocalLogin()) {
      this.keycloakReachable.set(false);
    }
  }

  @HostListener('window:pageshow', ['$event'])
  onPageShow(event: PageTransitionEvent): void {
    this.pkceRedirectLoading.set(false);
    if (event.persisted && this.auth.consumeRedirectAborted()) {
      this.keycloakRedirectAborted.set(true);
    }
  }

  async startKeycloakSso(): Promise<void> {
    if (this.pkceRedirectLoading()) {
      return;
    }
    if (this.keycloakReachable() === false) {
      return;
    }
    this.pkceRedirectLoading.set(true);
    this.error.set(null);
    this.keycloakRedirectAborted.set(false);
    try {
      await this.auth.startPlatformKeycloakPkceRedirect();
    } catch (err) {
      this.pkceRedirectLoading.set(false);
      this.error.set(
        err instanceof Error ? err.message : 'No se pudo redirigir a Keycloak.',
      );
    }
  }

  submit(): void {
    this.error.set(null);
    this.loadingLabel.set('Entrando con acceso local');
    this.loading.set(true);
    this.auth
      .login(this.email, this.password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (!this.auth.isBffMode() && result.accessToken) {
            setPlatformToken(result.accessToken);
          }
          void this.router.navigateByUrl('/tenants');
        },
        error: (e: unknown) => {
          this.error.set(this.errorMessage(e));
        },
      });
  }

  private isBackForwardNavigation(): boolean {
    if (typeof performance === 'undefined') {
      return false;
    }
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return nav?.type === 'back_forward';
  }

  private errorMessage(e: unknown): string {
    if (e instanceof Error && e.message.trim()) {
      return e.message;
    }
    if (e && typeof e === 'object' && 'error' in e) {
      const err = (e as { error?: { message?: unknown } }).error;
      if (typeof err?.message === 'string' && err.message.trim()) {
        return err.message;
      }
    }
    return 'No se pudo iniciar sesión.';
  }
}
