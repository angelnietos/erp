import { Component, HostListener, OnInit, inject, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  isSafeAppInternalPath,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
import { resolveTenantDisplayName } from '@generic-crm/shared-browser-data-access';
import { environment } from '../../environments/environment';
import {
  clearVerifactuPkceRedirectPending,
  consumeVerifactuPkceRedirectAborted,
} from './pkce.util';
import { VerifactuKeycloakAuthService } from './verifactu-keycloak-auth.service';

@Component({
  standalone: true,
  selector: 'app-verifactu-login',
  imports: [CommonModule],
  template: `
    <div class="login-layout">
      <aside class="login-brand" aria-hidden="true">
        <div class="login-brand__inner">
          <span class="login-brand__mark">VF</span>
          <p class="login-brand__eyebrow">Verifactu</p>
          <h2 class="login-brand__title">Facturación electrónica AEAT</h2>
          <p class="login-brand__lede">
            Cola de envíos, series fiscales, certificados y trazabilidad — independiente del ERP.
          </p>
          <ul class="login-brand__features">
            <li>Envío Verifactu con worker único</li>
            <li>Espejo CRM + webhooks de estado</li>
            <li>Multi-tenant listo para demo</li>
          </ul>
        </div>
      </aside>

      <main class="login-main">
        <div class="login-card">
          @if (handoffPending()) {
            <div class="handoff" role="status" aria-live="polite">
              <span class="spinner" aria-hidden="true"></span>
              <h1>Redirigiendo a Keycloak…</h1>
              <p>Acceso seguro a Verifactu.</p>
            </div>
          } @else {
            <p class="eyebrow">Iniciar sesión</p>
            <h1>Bienvenido</h1>
            <p class="lede">
              Acceso preferente con Keycloak (SSO). Si Keycloak no está disponible, usa acceso
              local con email y contraseña del CRM.
            </p>

            <p class="tenant-context">
              Tenant CRM · <strong>{{ tenantDisplayName() }}</strong>
              <code class="tenant-context__slug">{{ tenantSlug }}</code>
            </p>

            @if (erpHubUrl) {
              <a class="hub-link" [href]="erpHubUrl">Ir al hub</a>
            }

            @if (error()) {
              <p class="err" role="alert">{{ error() }}</p>
            }

            @if (isDev) {
              <p class="dev-hint">
                Demo: <code>admin&#64;demo.local</code> · <code>Demo12345!</code> · tenant
                <code>demo</code>
              </p>
            }

            @if (showRetry()) {
              <button type="button" class="btn-primary" (click)="startKeycloak()">
                Entrar con Keycloak
              </button>
            } @else if (!error()) {
              <button type="button" class="btn-primary" (click)="startKeycloak()">
                Entrar con Keycloak
              </button>
            }

            @if (showLocalFallback()) {
              <button type="button" class="btn-secondary" (click)="goLocalIdentity()">
                Acceso local (email/contraseña)
              </button>
            }
          }
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        font-family: var(--vf-font, system-ui, sans-serif);
      }
      .login-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100dvh;
      }
      .login-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5rem;
        background:
          radial-gradient(480px 320px at 10% 20%, rgba(16, 217, 129, 0.14), transparent 58%),
          radial-gradient(400px 280px at 90% 80%, rgba(14, 165, 233, 0.1), transparent 55%),
          linear-gradient(165deg, var(--vf-sidebar, #0a0f1c) 0%, var(--vf-sidebar-mid, #111827) 48%, var(--vf-sidebar-deep, #0d2818) 120%);
        color: var(--vf-text-on-dark, #eef2f8);
        border-right: 1px solid rgba(255, 255, 255, 0.06);
      }
      .login-brand__inner {
        max-width: 22rem;
      }
      .login-brand__mark {
        display: grid;
        place-items: center;
        width: 3.25rem;
        height: 3.25rem;
        margin-bottom: 1.35rem;
        border-radius: 1rem;
        font-family: var(--vf-font-display, inherit);
        font-size: 0.9rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: #042f1a;
        background: var(--vf-accent-gradient, linear-gradient(135deg, #34f5a8, #0d9f5f));
        box-shadow:
          0 0 36px var(--vf-accent-glow, rgba(16, 217, 129, 0.32)),
          inset 0 1px 0 rgb(255 255 255 / 0.35);
      }
      .login-brand__eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #6ee7b7;
        font-weight: 700;
      }
      .login-brand__title {
        margin: 0 0 0.75rem;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.75rem;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.03em;
      }
      .login-brand__lede {
        margin: 0 0 1.25rem;
        color: #94a3b8;
        line-height: 1.55;
      }
      .login-brand__features {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        font-size: 0.9rem;
        color: #cbd5e1;
      }
      .login-brand__features li::before {
        content: '✓';
        margin-right: 0.5rem;
        color: #34f5a8;
        font-weight: 800;
      }
      .login-main {
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--vf-bg, #f4f7fb);
      }
      .login-card {
        width: min(100%, 420px);
        padding: 2.15rem;
        border-radius: var(--vf-radius-lg, 1.25rem);
        background: var(--vf-bg-elevated, #fff);
        border: 1px solid var(--vf-border, #dde4ef);
        box-shadow: var(--vf-shadow-lg, 0 8px 24px rgb(12 18 34 / 0.08));
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--vf-accent, #0d9f5f);
        font-weight: 700;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-family: var(--vf-font-display, inherit);
        font-size: 1.55rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--vf-text, #0c1222);
      }
      .lede {
        margin: 0 0 1.25rem;
        color: var(--vf-text-muted, #64748b);
        line-height: 1.5;
        font-size: 0.95rem;
      }
      .tenant-context {
        margin: 0 0 0.85rem;
        padding: 0.65rem 0.85rem;
        border-radius: var(--vf-radius-sm, 0.625rem);
        font-size: 0.82rem;
        color: var(--vf-text-muted, #5c6b82);
        background: var(--vf-bg-subtle, #eef2f8);
        border: 1px solid var(--vf-border, #dde4ef);
      }
      .tenant-context__slug {
        margin-left: 0.35rem;
        padding: 0.12rem 0.45rem;
        border-radius: var(--vf-radius-pill, 999px);
        font-size: 0.72rem;
        font-weight: 700;
        background: var(--vf-accent-soft, rgba(16, 217, 129, 0.12));
        color: #047857;
        border: 1px solid rgba(16, 217, 129, 0.22);
      }
      .hub-link {
        display: inline-block;
        margin-bottom: 1rem;
        color: var(--vf-info, #2563eb);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
      }
      .handoff {
        text-align: center;
        color: var(--vf-text, #0f172a);
      }
      .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 2px solid #e2e8f0;
        border-top-color: var(--vf-accent-light, #22c55e);
        border-radius: 50%;
        animation: spin 0.85s linear infinite;
        margin-bottom: 1rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .err {
        color: var(--vf-danger, #dc2626);
        margin: 0 0 1rem;
        font-size: 0.9rem;
      }
      .dev-hint {
        font-size: 0.82rem;
        color: var(--vf-text-muted, #64748b);
        margin: 0 0 1rem;
        padding: 0.65rem 0.75rem;
        border-radius: var(--vf-radius-sm, 0.5rem);
        background: var(--vf-bg-subtle, #eef2f7);
      }
      .btn-primary,
      .btn-secondary {
        display: block;
        width: 100%;
        margin-top: 0.65rem;
        padding: 0.8rem 1rem;
        border-radius: var(--vf-radius-pill, 999px);
        text-align: center;
        font-weight: 700;
        cursor: pointer;
        border: none;
        font-family: inherit;
        font-size: 0.95rem;
        transition:
          transform var(--vf-duration, 0.2s) var(--vf-ease, ease),
          box-shadow var(--vf-duration, 0.2s) var(--vf-ease, ease),
          filter var(--vf-duration, 0.2s) var(--vf-ease, ease);
      }
      .btn-primary {
        background: var(--vf-accent-gradient, linear-gradient(135deg, #34f5a8, #0d9f5f));
        color: #042f1a;
        box-shadow: 0 8px 24px var(--vf-accent-glow, rgba(16, 217, 129, 0.28));
      }
      .btn-primary:hover {
        filter: brightness(1.04);
        transform: translateY(-1px);
      }
      .btn-secondary {
        background: transparent;
        color: var(--vf-text-muted, #5c6b82);
        border: 1px solid var(--vf-border-strong, #c8d2e0);
      }
      .btn-secondary:hover {
        background: var(--vf-bg-subtle, #eef2f8);
      }
      @media (max-width: 860px) {
        .login-layout {
          grid-template-columns: 1fr;
        }
        .login-brand {
          display: none;
        }
      }
    `,
  ],
})
export class VerifactuLoginComponent implements OnInit {
  private readonly auth = inject(VerifactuKeycloakAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tokens = inject(SessionTokenStorageService);

  readonly handoffPending = signal(false);
  readonly error = signal('');
  readonly showRetry = signal(false);
  /** Keycloak configurado pero no responde (infra caída). */
  readonly keycloakUnavailable = signal(false);
  readonly isDev = isDevMode();
  readonly erpHubUrl = environment.erpHubUrl;
  tenantSlug = environment.defaultTenantSlug;

  tenantDisplayName(): string {
    return resolveTenantDisplayName(this.tenantSlug);
  }

  private returnUrl = '/verifactu/overview';

  ngOnInit(): void {
    this.returnUrl = this.readReturnUrl();
    this.tenantSlug =
      this.route.snapshot.queryParamMap.get('tenant')?.trim() ||
      environment.defaultTenantSlug;

    const queryError = this.route.snapshot.queryParamMap.get('error')?.trim();
    if (queryError) {
      if (this.isUserCancelledOidc(queryError)) {
        this.error.set(queryError);
        this.showRetry.set(true);
        return;
      }
      this.goLocalIdentity();
      return;
    }

    if (this.tokens.getAccessToken()) {
      void this.router.navigateByUrl(this.returnUrl);
      return;
    }

    if (consumeVerifactuPkceRedirectAborted()) {
      this.error.set('Inicio de sesión cancelado en Keycloak.');
      this.showRetry.set(true);
      return;
    }

    if (this.route.snapshot.queryParamMap.get('local') === '1') {
      this.goLocalIdentity();
      return;
    }

    if (!this.auth.canUseKeycloak(this.tenantSlug)) {
      this.goLocalIdentity();
      return;
    }

    this.handoffPending.set(true);
    this.auth.isKeycloakAvailable(this.tenantSlug).subscribe({
      next: (available) => {
        if (!available) {
          this.goLocalIdentity();
          return;
        }
        void this.startKeycloak();
      },
      error: () => {
        this.goLocalIdentity();
      },
    });
  }

  /** Fallback local cuando KC falla, no está configurado o el usuario cancela OIDC. */
  showLocalFallback(): boolean {
    return (
      this.keycloakUnavailable() ||
      this.showRetry() ||
      Boolean(this.error()) ||
      !this.auth.canUseKeycloak(this.tenantSlug)
    );
  }

  goLocalIdentity(): void {
    void this.router.navigate(['/identity'], {
      queryParams: { returnUrl: this.returnUrl, tenant: this.tenantSlug },
    });
  }

  private isUserCancelledOidc(message: string): boolean {
    return /access_denied|login_required|consent_required|interaction_required|cancel/i.test(
      message,
    );
  }

  @HostListener('window:pageshow')
  onPageShow(): void {
    if (consumeVerifactuPkceRedirectAborted()) {
      this.handoffPending.set(false);
      this.error.set('Inicio de sesión cancelado.');
      this.showRetry.set(true);
    }
  }

  startKeycloak(): void {
    this.error.set('');
    this.keycloakUnavailable.set(false);
    this.handoffPending.set(true);
    this.showRetry.set(false);
    void this.auth
      .startKeycloakRedirect({
        tenantSlug: this.tenantSlug,
        returnUrl: this.returnUrl,
      })
      .catch((e: unknown) => {
        this.handoffPending.set(false);
        this.keycloakUnavailable.set(true);
        this.error.set(
          e instanceof Error
            ? e.message
            : 'No se pudo iniciar Keycloak. Usa acceso local.',
        );
        this.showRetry.set(true);
        clearVerifactuPkceRedirectPending();
      });
  }

  private readReturnUrl(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl')?.trim() ?? '';
    if (raw && isSafeAppInternalPath(raw)) {
      return raw;
    }
    return '/verifactu/overview';
  }
}
