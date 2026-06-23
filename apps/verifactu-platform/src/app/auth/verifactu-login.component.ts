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
    <div class="login-shell">
      <div class="login-card">
        @if (handoffPending()) {
          <div class="handoff" role="status" aria-live="polite">
            <span class="spinner" aria-hidden="true"></span>
            <h1>Redirigiendo a Keycloak…</h1>
            <p>Acceso seguro a Verifactu (facturación AEAT).</p>
          </div>
        } @else {
          <p class="eyebrow">Verifactu · CRM</p>
          <h1>Facturación electrónica</h1>
          <p class="lede">
            Huella fiscal, cola de envíos y credenciales AEAT — app independiente del ERP.
          </p>

          @if (erpHubUrl) {
            <a class="hub-link" [href]="erpHubUrl">← Cambiar aplicación (Babooni Hub)</a>
          }

          @if (error()) {
            <p class="err">{{ error() }}</p>
          }

          @if (isDev) {
            <p class="dev-hint">
              Demo KC: <code>admin&#64;demo.local</code> · contraseña
              <code>Demo12345!</code> · tenant <code>demo</code>
            </p>
          }

          @if (showRetry()) {
            <button type="button" class="btn-primary" (click)="startKeycloak()">
              Entrar con Keycloak
            </button>
          }

          <button type="button" class="btn-secondary" (click)="goLocalIdentity()">
            Acceso local (email/contraseña)
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 1.5rem;
        background: radial-gradient(circle at 20% 20%, #1e1b4b, #0f172a 55%, #020617);
        color: #f8fafc;
        font-family: system-ui, sans-serif;
      }
      .login-card {
        width: min(100%, 420px);
        padding: 2rem;
        border-radius: 1.25rem;
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.2);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #86efac;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.45rem;
      }
      .lede {
        margin: 0 0 1.25rem;
        color: #cbd5e1;
        line-height: 1.5;
      }
      .hub-link {
        display: inline-block;
        margin-bottom: 1rem;
        color: #93c5fd;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .handoff {
        text-align: center;
      }
      .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 2px solid rgba(255, 255, 255, 0.15);
        border-top-color: #22c55e;
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
        color: #fca5a5;
        margin: 0 0 1rem;
      }
      .dev-hint {
        font-size: 0.82rem;
        color: #94a3b8;
        margin: 0 0 1rem;
      }
      .btn-primary,
      .btn-secondary {
        display: block;
        width: 100%;
        margin-top: 0.65rem;
        padding: 0.75rem 1rem;
        border-radius: 0.65rem;
        text-align: center;
        text-decoration: none;
        font-weight: 600;
        cursor: pointer;
        border: none;
      }
      .btn-primary {
        background: linear-gradient(90deg, #22c55e, #16a34a);
        color: #052e16;
      }
      .btn-secondary {
        background: transparent;
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.35);
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

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'logout') {
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
