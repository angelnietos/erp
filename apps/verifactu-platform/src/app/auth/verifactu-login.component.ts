import { Component, HostListener, OnInit, inject, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  isSafeAppInternalPath,
  SessionTokenStorageService,
} from '@generic-crm/shared-browser-data-access';
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
              Entra con Keycloak o usa acceso local para la demo con el cliente.
            </p>

            @if (erpHubUrl) {
              <a class="hub-link" [href]="erpHubUrl">← Volver al Babooni Hub</a>
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

            <button type="button" class="btn-secondary" (click)="goLocalIdentity()">
              Acceso local (email/contraseña)
            </button>
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
        background: linear-gradient(160deg, #0b1220 0%, #0f172a 45%, #14532d 120%);
        color: #e2e8f0;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
      }
      .login-brand__inner {
        max-width: 22rem;
      }
      .login-brand__mark {
        display: grid;
        place-items: center;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1.25rem;
        border-radius: 0.75rem;
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #052e16;
        background: linear-gradient(135deg, #4ade80, #16a34a);
        box-shadow: 0 0 32px var(--vf-accent-glow, rgba(34, 197, 94, 0.28));
      }
      .login-brand__eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #86efac;
      }
      .login-brand__title {
        margin: 0 0 0.75rem;
        font-size: 1.65rem;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.02em;
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
        color: #4ade80;
        font-weight: 700;
      }
      .login-main {
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--vf-bg, #f4f7fb);
      }
      .login-card {
        width: min(100%, 400px);
        padding: 2rem;
        border-radius: var(--vf-radius, 0.75rem);
        background: var(--vf-bg-elevated, #fff);
        border: 1px solid var(--vf-border, #e2e8f0);
        box-shadow: var(--vf-shadow, 0 8px 24px rgb(15 23 42 / 0.06));
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--vf-accent, #16a34a);
        font-weight: 600;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.45rem;
        color: var(--vf-text, #0f172a);
      }
      .lede {
        margin: 0 0 1.25rem;
        color: var(--vf-text-muted, #64748b);
        line-height: 1.5;
        font-size: 0.95rem;
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
        padding: 0.75rem 1rem;
        border-radius: 0.55rem;
        text-align: center;
        font-weight: 600;
        cursor: pointer;
        border: none;
        font-family: inherit;
        font-size: 0.95rem;
      }
      .btn-primary {
        background: linear-gradient(90deg, #22c55e, #16a34a);
        color: #052e16;
      }
      .btn-primary:hover {
        filter: brightness(1.03);
      }
      .btn-secondary {
        background: transparent;
        color: var(--vf-text-muted, #64748b);
        border: 1px solid var(--vf-border, #e2e8f0);
      }
      .btn-secondary:hover {
        background: var(--vf-bg-subtle, #eef2f7);
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
  readonly isDev = isDevMode();
  readonly erpHubUrl = environment.erpHubUrl;

  private returnUrl = '/verifactu/overview';
  private tenantSlug = environment.defaultTenantSlug;

  ngOnInit(): void {
    this.returnUrl = this.readReturnUrl();
    this.tenantSlug =
      this.route.snapshot.queryParamMap.get('tenant')?.trim() ||
      environment.defaultTenantSlug;

    const queryError = this.route.snapshot.queryParamMap.get('error')?.trim();
    if (queryError) {
      this.error.set(queryError);
      this.showRetry.set(true);
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
      void this.router.navigate(['/identity'], {
        queryParams: { returnUrl: this.returnUrl, tenant: this.tenantSlug },
      });
      return;
    }

    if (!this.auth.canUseKeycloak(this.tenantSlug)) {
      this.error.set('Keycloak no configurado — usa acceso local.');
      this.showRetry.set(false);
      return;
    }

    this.handoffPending.set(true);
    void this.startKeycloak();
  }

  goLocalIdentity(): void {
    void this.router.navigate(['/identity'], {
      queryParams: { returnUrl: this.returnUrl, tenant: this.tenantSlug },
    });
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
    this.handoffPending.set(true);
    this.showRetry.set(false);
    void this.auth
      .startKeycloakRedirect({
        tenantSlug: this.tenantSlug,
        returnUrl: this.returnUrl,
      })
      .catch((e: unknown) => {
        this.handoffPending.set(false);
        this.error.set(e instanceof Error ? e.message : 'No se pudo iniciar Keycloak.');
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
