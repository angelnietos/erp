import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { isSafeAppInternalPath } from '@generic-crm/shared-browser-data-access';
import { readVerifactuPkceSession } from './pkce.util';
import { VerifactuKeycloakAuthService } from './verifactu-keycloak-auth.service';

@Component({
  standalone: true,
  selector: 'app-verifactu-login-callback',
  template: `
    <div class="shell" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>Completando acceso a Verifactu…</p>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        place-items: center;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        color: #e2e8f0;
        background: #0f172a;
      }
      .shell {
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
    `,
  ],
})
export class VerifactuLoginCallbackComponent {
  private readonly auth = inject(VerifactuKeycloakAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code')?.trim() ?? '';
    const state = this.route.snapshot.queryParamMap.get('state')?.trim() ?? '';
    const kcError =
      this.route.snapshot.queryParamMap.get('error_description') ??
      this.route.snapshot.queryParamMap.get('error');
    const stored = readVerifactuPkceSession();
    const returnUrl =
      stored?.returnUrl && isSafeAppInternalPath(stored.returnUrl)
        ? stored.returnUrl
        : '/verifactu/overview';

    if (kcError) {
      const errStr = String(kcError);
      if (this.isUserCancelledOidc(errStr)) {
        void this.router.navigate(['/login'], {
          queryParams: {
            returnUrl,
            error: errStr,
            tenant: stored?.tenantSlug,
          },
        });
        return;
      }
      this.goLocalIdentity(returnUrl, stored?.tenantSlug);
      return;
    }
    if (!code || !state) {
      this.goLocalIdentity(returnUrl, stored?.tenantSlug);
      return;
    }

    this.auth
      .completePkceCallback(code, state)
      .pipe(finalize(() => undefined))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.goLocalIdentity(returnUrl, stored?.tenantSlug);
        },
      });
  }

  /** Usuario canceló o cerró Keycloak — mostrar login con reintento. */
  private isUserCancelledOidc(message: string): boolean {
    return /access_denied|login_required|consent_required|interaction_required/i.test(
      message,
    );
  }

  /** Fallback local cuando OIDC no puede completarse (KC caído, API, etc.). */
  private goLocalIdentity(returnUrl: string, tenantSlug?: string): void {
    void this.router.navigate(['/identity'], {
      queryParams: {
        returnUrl,
        ...(tenantSlug?.trim() ? { tenant: tenantSlug.trim() } : {}),
      },
    });
  }
}
